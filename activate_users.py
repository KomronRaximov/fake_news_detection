import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User

count = User.objects.all().update(is_active=True)
print(f"Successfully activated {count} users.")
