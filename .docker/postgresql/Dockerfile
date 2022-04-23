FROM postgres:14-alpine

ENV POSTGRES_USER: expectopatronum
ENV POSTGRES_PASSWORD: expectopatronum
ENV POSTGRES_DB: expectopatronum

COPY *.sql /docker-entrypoint-initdb.d/
