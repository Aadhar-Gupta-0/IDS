import sys,json
from pathlib import Path
import numpy as np,pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.metrics import roc_auc_score,accuracy_score,f1_score
from catboost import CatBoostClassifier
from train import engineer_features,SPLIT_SEED,TEST_SIZE,BEST_PARAMS
fold=int(sys.argv[1])
df=pd.read_csv('archive/aug_train.csv');y=df.target.astype(int);raw=df.drop(columns=['target'])
Xd,_,yd,_=train_test_split(raw,y,test_size=TEST_SIZE,random_state=SPLIT_SEED,stratify=y)
X,cat=engineer_features(Xd)
skf=StratifiedKFold(n_splits=5,shuffle=True,random_state=SPLIT_SEED)
tr,va=list(skf.split(X,yd))[fold-1]
m=CatBoostClassifier(**BEST_PARAMS,random_seed=SPLIT_SEED+fold)
m.fit(X.iloc[tr],yd.iloc[tr],cat_features=cat,eval_set=(X.iloc[va],yd.iloc[va]),early_stopping_rounds=80,verbose=False)
p=m.predict_proba(X.iloc[va])[:,1]
Path('outputs/oof').mkdir(parents=True,exist_ok=True)
pd.DataFrame({'idx':va,'y':yd.iloc[va].to_numpy(),'prob':p}).to_csv(f'outputs/oof/fold_{fold}.csv',index=False)
json.dump({'fold':fold,'best_iteration':int(m.best_iteration_+1),'auc':roc_auc_score(yd.iloc[va],p),'accuracy05':accuracy_score(yd.iloc[va],p>=.5),'f105':f1_score(yd.iloc[va],p>=.5)},open(f'outputs/oof/fold_{fold}.json','w'),indent=2)
print(open(f'outputs/oof/fold_{fold}.json').read())
