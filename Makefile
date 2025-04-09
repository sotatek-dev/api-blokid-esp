pre-deploy:
	docker container prune -f; \
	docker images -q | tail -n +5 | xargs docker rmi; \
	[ -f sofc-image.tar ] && rm sofc-image.tar; \
	echo "Pre-deploy done!"

deploy:
	docker stop api-sofc && \
	docker load -i sofc-image.tar && \
	docker compose up -d api

restart:
	docker stop api-sofc && \
	docker compose up -d api
