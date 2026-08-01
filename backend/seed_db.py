import os
import sys
import django

sys.path.insert(0, r'c:\codes\DoubtDesk\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from Doubt.models import Student, Faculty, Admin
from Doubt.views import _hash_pass

def seed():
    print("Seeding database with 1 inserted record for Student, Faculty, and Admin...")

    # 1. Student record
    # Username: Enrollment (24002170510023), Password: 123456 (6 digits)
    student, created = Student.objects.get_or_create(
        Enroll="24002170510023",
        defaults={
            "RollNo": "101",
            "Name": "Lunagariya Hinav",
            "Div": "A",
            "Branch": "Artificial Intelligence & Data Science (AIDS)",
            "Pass": _hash_pass("123456"),
        }
    )
    student.Pass = _hash_pass("123456")
    student.save()
    print("Student ready: Enroll = 24002170510023, Pass = 123456 (6 digits)")

    # 2. Faculty record
    # Username: ShortName (RKP - UPPERCASE), Password: 1234 (4 digits)
    faculty, created = Faculty.objects.get_or_create(
        ShortName="RKP",
        defaults={
            "FullName": "Dr. R. K. Patel",
            "Subject": "Computer Engineering",
            "MoNumber": "+91 9876543210",
            "Pass": _hash_pass("1234"),
        }
    )
    faculty.Pass = _hash_pass("1234")
    faculty.save()
    print("Faculty ready: ShortName = RKP, Pass = 1234 (4 digits)")

    # 3. Admin record
    # Username: Adminname (admin), Password: 1234 (4 digits)
    admin, created = Admin.objects.get_or_create(
        Adminname="admin",
        defaults={
            "Password": _hash_pass("1234"),
        }
    )
    admin.Password = _hash_pass("1234")
    admin.save()
    print("Admin ready: Adminname = admin, Password = 1234 (4 digits)")

    print("\nDatabase updated with 6-digit student password and 4-digit faculty/admin passwords!")

if __name__ == "__main__":
    seed()
