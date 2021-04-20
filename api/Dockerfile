FROM alpine:latest

LABEL maintainer="Ryan Clark"
WORKDIR /code
ENV FLASK_APP=app
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_ENV=production
ENV FLASK_DEBUG=0
ENV FLASK_SECRET_KEY=fu-F-SRF43F$gfQEgerG(U£$-i-jds
ENV MYSQL_URI=mysql+pymysql://queue_user:queue_password@mysql/queue_db
ENV REDIS_URI=redis://redis:6379

# RUN apk add --no-cache gcc musl-dev linux-headers
RUN apk update \
    && apk add --virtual build-deps gcc g++ python3-dev musl-dev \
    && apk add tesseract-ocr \
    && apk add python3 \
    && apk add jpeg-dev zlib-dev libjpeg  \
    && apk add libffi-dev openssl-dev \
    py-pip \
    && pip install virtualenv
# && apk del build-deps

COPY requirements.txt requirements.txt
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
EXPOSE 5000
COPY . .
CMD ["flask", "run"]