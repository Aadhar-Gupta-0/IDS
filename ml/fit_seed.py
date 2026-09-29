import sys,json
from pathlib import Path
import pandas as pd
from sklearn.model_selection import train_test_split
from catboost import CatBoostClassifier
from train import engineer_features,SPLIT_SEED,TEST_SIZE,BEST_PARAMS
seed=int(sys.argv[1])
s=json.load(open('outputs/oof_summary.json'));iters=s['final_iterations']
df=pd.read_csv('archive/aug_train.csv');y=df.target.astype(int);raw=df.drop(columns=['target'])
Xd,Xt,yd,yt=train_test_split(raw,y,test_size=TEST_SIZE,random_state=SPLIT_SEED,stratify=y)
Xdev,cat=engineer_features(Xd);Xtest,_=engineer_features(Xt)
p=dict(BEST_PARAMS);p['iterations']=iters;p['random_seed']=seed
m=CatBoostClassifier(**p);m.fit(Xdev,yd,cat_features=cat,verbose=False)
Path('outputs/best_model').mkdir(parents=True,exist_ok=True);m.save_model(f'outputs/best_model/catboost_seed_{seed}.cbm')
pd.DataFrame({'row':range(len(Xtest)),'y':yt.to_numpy(),'prob':m.predict_proba(Xtest)[:,1]}).to_csv(f'outputs/best_model/test_pred_{seed}.csv',index=False)
print(seed,'done',iters)
