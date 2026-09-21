# Data Dictionary

| Column | Plain-English meaning | Raw type | Example values |
|---|---|---|---|
| `enrollee_id` | Unique candidate identifier | Integer | `8949`, `29725` |
| `city` | Code identifying candidate city | Categorical | `city_103`, `city_40` |
| `city_development_index` | Development index associated with city | Numeric | `0.920`, `0.776` |
| `gender` | Candidate gender | Categorical | Male, Female, Other |
| `relevent_experience` | Whether candidate has relevant experience | Categorical | Has relevent experience, No relevent experience |
| `enrolled_university` | Current university-enrolment status | Categorical | no_enrollment, Full time course, Part time course |
| `education_level` | Highest education level | Ordered categorical | Graduate, Masters, High School, Phd |
| `major_discipline` | Candidate educational discipline | Nominal categorical | STEM, Business Degree, Humanities |
| `experience` | Total professional experience | Ordered text | `<1`, `5`, `10`, `>20` |
| `company_size` | Size of current employer | Ordered categorical | `<10`, `50-99`, `1000-4999`, `10000+` |
| `company_type` | Type of current employer | Nominal categorical | Pvt Ltd, Funded Startup, Public Sector |
| `last_new_job` | Years since previous job change | Ordered text | `never`, `1`, `2`, `>4` |
| `training_hours` | Training completed by candidate | Numeric | `36`, `47`, `83` |
| `target` | Whether candidate is looking for a job change | Binary | `0`, `1` |

## Target
- `0` = not looking for a job change
- `1` = looking for a job change
