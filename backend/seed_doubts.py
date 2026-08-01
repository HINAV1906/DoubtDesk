import os
import sys
import django

sys.path.insert(0, r'c:\codes\DoubtDesk\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from Doubt.models import Faculty, Student, Doubt

def seed_sample_doubt():
    print("Seeding sample doubts for testing...")

    fac_rkp = Faculty.objects.filter(ShortName='RKP').first()
    fac_amp = Faculty.objects.filter(ShortName='AMP').first()

    if not fac_rkp:
        print("Faculty RKP not found.")
        return

    doubt1, created = Doubt.objects.get_or_create(
        Enroll="24002170510023",
        Doubt="How to implement a binary search tree insertion algorithm in C++?",
        defaults={
            "Name": "Lunagariya Hinav",
            "Batch": "Div-A - AIDS",
            "Sub": "Data Structures & Algorithms",
            "Faculty": fac_rkp,
            "status": "pending",
        }
    )

    if fac_amp:
        doubt2, created = Doubt.objects.get_or_create(
            Enroll="24002170510023",
            Doubt="What is the difference between primary key and candidate key in DBMS?",
            defaults={
                "Name": "Lunagariya Hinav",
                "Batch": "Div-A - AIDS",
                "Sub": "Database Management Systems (DBMS)",
                "Faculty": fac_amp,
                "status": "solved",
                "Solution": "A Candidate Key is a set of attributes that can uniquely identify a tuple. Primary Key is the specific candidate key chosen by the database designer.",
            }
        )

    print("Sample doubts seeded successfully!")

if __name__ == '__main__':
    seed_sample_doubt()
