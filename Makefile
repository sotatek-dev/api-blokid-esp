build-image:
	docker compose build api \
		--build-arg gitUserName="$(gitUserName)" \
		--build-arg gitUserEmail="$(gitUserEmail)" \
		--build-arg gitBranch="$(gitBranch)" \
		--build-arg gitCommitHash="$(gitCommitHash)" \
		--build-arg gitCommitMessage="$(gitCommitMessage)" \
		--build-arg isCommitted="$(isCommitted)" \
		--build-arg deployTime="$(deployTime)"

deploy:
	docker compose stop api && \
  	docker compose rm api -f && \
	docker compose up -d api

restart:
	docker compose restart api

inspect:
	docker inspect -f '{{ json .Config.Labels }}' api-blokid

migrate-dev:
	docker exec -it api-blokid bash -c "npx prisma migrate dev"

migrate-prod:
	docker exec -it api-blokid bash -c "npx prisma migrate deploy"
