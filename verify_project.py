from pathlib import Path
import json, sys
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parent
errors=[]
required=['index.html','styles.css','presentation.css','app.js','presentation.js','data.js','server.py','requirements.txt']
for f in required:
    if not (ROOT/f).exists(): errors.append(f'Missing {f}')
for f in ['catboost_seed_2026.cbm','catboost_seed_3407.cbm','catboost_seed_9001.cbm','config.json','final_test_metrics.json']:
    if not (ROOT/'model'/f).exists(): errors.append(f'Missing model/{f}')
try:
    from server import app
    c=TestClient(app)
    h=c.get('/api/health')
    if h.status_code!=200 or not h.json().get('ok'): errors.append('Health endpoint failed')
    sample={'city':'city_21','city_development_index':0.624,'gender':'Male','relevent_experience':'Has relevent experience','enrolled_university':'no_enrollment','education_level':'Graduate','major_discipline':'STEM','experience':'<1','company_size':None,'company_type':None,'last_new_job':'1','training_hours':120}
    r=c.post('/api/predict',json=sample)
    if r.status_code!=200: errors.append(f'Prediction endpoint failed: {r.text}')
    else:
        p=r.json()['job_change_probability']
        if not 0<=p<=1: errors.append('Prediction probability out of range')
        print(f'Live model smoke-test probability: {p:.4f}')
    for pth in ['/','/styles.css','/presentation.css','/app.js','/presentation.js','/data.js']:
        rr=c.get(pth)
        if rr.status_code!=200: errors.append(f'Static route failed: {pth}')
except Exception as e:
    errors.append(f'Runtime verification exception: {e}')

if errors:
    print('\nPROJECT CHECK: FAILED')
    for e in errors: print(' -',e)
    sys.exit(1)
print('\nPROJECT CHECK: PASSED')
print('Website, static assets, API, and all 3 CatBoost model files are available.')
