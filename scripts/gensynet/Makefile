run: build
	docker run -it -v $$(pwd):/gensynet gensynet

build: depends
	docker build -t gensynet .

depends:
	docker -v
