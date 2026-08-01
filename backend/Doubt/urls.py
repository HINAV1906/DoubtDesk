from django.urls import path
from . import views

urlpatterns = [
    # Unified login — tries Admin → Faculty → Student automatically
    path('login/',          views.unified_login,       name='unified-login'),

    # Individual role logins (kept for direct API use)
    path('login/student/',  views.student_login,       name='student-login'),
    path('login/faculty/',  views.faculty_login,       name='faculty-login'),
    path('login/admin/',    views.admin_login,         name='admin-login'),

    # Change password
    path('change-password/', views.change_password,    name='change-password'),

    # Logout (common)
    path('logout/',         views.logout_view,         name='logout'),

    # Faculty list (for dropdowns)
    path('faculty/',        views.faculty_list,        name='faculty-list'),

    # Notes
    path('notes/',                          views.notes_list,          name='notes-list'),
    path('notes/upload/',                   views.notes_upload,        name='notes-upload'),
    path('notes/<int:note_id>/delete/',     views.notes_delete,        name='notes-delete'),

    # Doubts
    path('doubts/',                         views.doubt_list,          name='doubt-list'),
    path('doubts/submit/',                  views.doubt_submit,        name='doubt-submit'),
    path('doubts/<int:doubt_id>/solve/',    views.doubt_solve,         name='doubt-solve'),
    path('doubts/<int:doubt_id>/status/',   views.doubt_status_update, name='doubt-status'),
    path('doubts/<int:doubt_id>/delete/',   views.doubt_delete,        name='doubt-delete'),



    # Solve
    path('solve/',          views.solve_list,          name='solve-list'),
    path('solve/create/',   views.solve_create,        name='solve-create'),

    # Admin — student/faculty management
    path('admin/add-student/',      views.admin_add_student,      name='admin-add-student'),
    path('admin/add-student-csv/',  views.admin_add_student_csv,  name='admin-add-student-csv'),
    path('admin/delete-student/',   views.admin_delete_student,   name='admin-delete-student'),
    path('admin/add-faculty/',      views.admin_add_faculty,      name='admin-add-faculty'),
    path('admin/add-faculty-csv/',  views.admin_add_faculty_csv,  name='admin-add-faculty-csv'),
    path('admin/delete-faculty/',   views.admin_delete_faculty,   name='admin-delete-faculty'),

    # Notifications
    path('notifications/',                views.notifications_list,         name='notifications-list'),
    path('notifications/<int:pk>/read/',  views.notification_mark_read,    name='notification-mark-read'),
    path('notifications/read-all/',       views.notifications_mark_all_read,name='notifications-mark-all-read'),

    # Analytics & Doubt Threading
    path('analytics/',                     views.analytics_data,             name='analytics-data'),
    path('analytics/faculty-stats/',       views.faculty_doubt_stats,        name='faculty-doubt-stats'),
    path('admin/send-reminder/',           views.admin_send_reminder,        name='admin-send-reminder'),
    path('doubts/<int:doubt_id>/comments/',views.doubt_comments_list_create, name='doubt-comments'),

]


