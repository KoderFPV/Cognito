FROM semitechnologies/transformers-inference:custom
RUN MODEL_NAME=Snowflake/snowflake-arctic-embed-l-v2.0 ./download.py
