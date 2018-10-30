start:
	python manage.py startapp blog

migrate: makemigrations
	python manage.py migrate

makemigrations:
	python manage.py makemigrations blog

test:
	coverage run --source='./blog' manage.py test
	coverage run --branch --source='./blog' manage.py test

report: test
	coverage report -m
