# spoken_english/migrations/0005_make_module_required.py
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    dependencies = [
        ('spoken_english', '0004_spokenenglishmodule_spokenenglishcontent_module_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='spokenenglishcontent',
            name='module',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='items',
                to='spoken_english.spokenenglishmodule',
                help_text='Parent module / set for this item'
            ),
        ),
        migrations.AlterField(
            model_name='spokenenglishtestattempt',
            name='test_module',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='test_attempts',
                to='spoken_english.spokenenglishmodule',
                help_text='Associated test module / set'
            ),
        ),
    ]
