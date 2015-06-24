.PHONY: test

install:
	npm install

build:
	${CURDIR}/node_modules/.bin/webpack --optimize-minimize --output-file=queuer.min.js

build-dev:
	${CURDIR}/node_modules/.bin/webpack --output-file=queuer.min.js

watch:
	${CURDIR}/node_modules/.bin/webpack --watch --output-file=queuer.min.js

test:
	${CURDIR}/node_modules/karma/bin/karma start test/karma.config.js --single-run
