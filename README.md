# learning-graphql

## mongoDBの立ち上げ方

 - `docker pull mongo`
 - `docker run -p 28001:27017 --name dev-mongo -d mongo`

## テーブルの作り方

 - `docker ps` でコンテナ名を調べる
 - `docker exec -it <container_id> bash`
 - `mongo`
 - `use photo-share-api;`
 - `show dbs;`

## データの作り方

 - `docker ps` でコンテナ名を調べる
 - `docker exec -it <container_id> bash`
 - `mongo`
 - `use photo-share-api;`
 - `db.users.insert({ githubLogin:1, name: 'hoge' })`
