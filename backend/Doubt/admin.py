from django.contrib import admin
from .models import Student, Faculty, Notes, Doubt, Solve, Admin


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('RollNo', 'Enroll', 'Name', 'Div', 'Branch')
    search_fields = ('Enroll', 'Name', 'RollNo')


@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = ('FullName', 'ShortName', 'Subject', 'MoNumber')
    search_fields = ('FullName', 'ShortName')


@admin.register(Notes)
class NotesAdmin(admin.ModelAdmin):
    list_display = ('Sem', 'Faze', 'Faculty')
    list_filter  = ('Sem', 'Faze')


@admin.register(Doubt)
class DoubtAdmin(admin.ModelAdmin):
    list_display  = ('Name', 'Enroll', 'Batch', 'Sub', 'Faculty', 'status')
    list_filter   = ('status', 'Faculty')
    search_fields = ('Name', 'Enroll')


@admin.register(Solve)
class SolveAdmin(admin.ModelAdmin):
    list_display = ('FacultyName', 'ShortName', 'Subject')


@admin.register(Admin)
class AdminAdmin(admin.ModelAdmin):
    list_display = ('Adminname',)
