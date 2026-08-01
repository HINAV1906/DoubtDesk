import os
import hashlib
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

from .models import Student, Faculty, Notes, Doubt, Solve, Admin, Notification, DoubtComment



# ── Password helper ───────────────────────────────────────────────────────────

def _hash_pass(raw):
    """Simple SHA-256 hash for custom model passwords."""
    return hashlib.sha256(raw.encode()).hexdigest()

def _check_pass(raw, hashed):
    return _hash_pass(raw) == hashed or raw == hashed

def _validate_password(password, role):
    if not password or not str(password).isdigit():
        return "Only digits are allowed in password."
    pwd_str = str(password).strip()
    if role == 'student' and len(pwd_str) != 6:
        return "Student password must be exactly 6 digits."
    if role in ['faculty', 'admin'] and len(pwd_str) != 4:
        return f"{role.capitalize()} password must be exactly 4 digits."
    return None


# ── Notification Helper ────────────────────────────────────────────────────────

def create_notification(recipient_role, recipient_id, title, message, link=None):
    """Utility function to create a new notification record."""
    try:
        Notification.objects.create(
            recipient_role=recipient_role,
            recipient_id=str(recipient_id),
            title=title,
            message=message,
            link=link
        )
    except Exception as e:
        print(f"Error creating notification: {e}")



# ── Unified Login ─────────────────────────────────────────────────────────────
# Tries Admin → Faculty → Student in order.
# Admin:   username field matched against Adminname
# Faculty: username field matched against ShortName
# Student: username field matched against Enroll

@api_view(['POST'])
@permission_classes([AllowAny])
def unified_login(request):
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '').strip()
    requested_role = request.data.get('role', '').strip().lower()

    if not username or not password:
        return Response({'error': 'Username and password are required.'},
                        status=status.HTTP_400_BAD_REQUEST)

    # 1. If 'student' role specified
    if requested_role == 'student':
        try:
            student = Student.objects.get(Enroll__iexact=username)
            if not _check_pass(password, student.Pass):
                return Response({'error': 'Incorrect student password.'},
                                status=status.HTTP_401_UNAUTHORIZED)
            django_user, _ = User.objects.get_or_create(username=f"student_{student.Enroll}")
            token, _       = Token.objects.get_or_create(user=django_user)
            return Response({
                'token':   token.key,
                'role':    'student',
                'enroll':  student.Enroll,
                'name':    student.Name,
                'rollno':  student.RollNo,
                'div':     student.Div,
                'branch':  student.Branch,
            })
        except Student.DoesNotExist:
            return Response({'error': 'Invalid Student enrollment number or credentials. Please select the correct login tab.'},
                            status=status.HTTP_401_UNAUTHORIZED)

    # 2. If 'faculty' role specified
    elif requested_role == 'faculty':
        try:
            faculty = Faculty.objects.get(ShortName__iexact=username)
            if not _check_pass(password, faculty.Pass):
                return Response({'error': 'Incorrect faculty password.'},
                                status=status.HTTP_401_UNAUTHORIZED)
            django_user, _ = User.objects.get_or_create(username=f"faculty_{faculty.ShortName}")
            token, _       = Token.objects.get_or_create(user=django_user)
            return Response({
                'token':     token.key,
                'role':      'faculty',
                'fullname':  faculty.FullName,
                'shortname': faculty.ShortName,
                'subject':   faculty.Subject,
                'mobile':    faculty.MoNumber,
            })
        except Faculty.DoesNotExist:
            return Response({'error': 'Invalid Faculty shortcode or credentials. Please select the correct login tab.'},
                            status=status.HTTP_401_UNAUTHORIZED)

    # 3. If 'admin' role specified
    elif requested_role == 'admin':
        try:
            admin = Admin.objects.get(Adminname__iexact=username)
            if not _check_pass(password, admin.Password):
                return Response({'error': 'Incorrect admin password.'},
                                status=status.HTTP_401_UNAUTHORIZED)
            django_user, _ = User.objects.get_or_create(username=f"admin_{admin.Adminname}")
            token, _       = Token.objects.get_or_create(user=django_user)
            return Response({
                'token': token.key,
                'role':  'admin',
                'name':  admin.Adminname,
            })
        except Admin.DoesNotExist:
            return Response({'error': 'Invalid Admin username or credentials. Please select the correct login tab.'},
                            status=status.HTTP_401_UNAUTHORIZED)

    # ── Fallback (if no role parameter supplied) ──
    # Check Admin
    try:
        admin = Admin.objects.get(Adminname__iexact=username)
        if _check_pass(password, admin.Password):
            django_user, _ = User.objects.get_or_create(username=f"admin_{admin.Adminname}")
            token, _       = Token.objects.get_or_create(user=django_user)
            return Response({'token': token.key, 'role': 'admin', 'name': admin.Adminname})
    except Admin.DoesNotExist:
        pass

    # Check Faculty
    try:
        faculty = Faculty.objects.get(ShortName__iexact=username)
        if _check_pass(password, faculty.Pass):
            django_user, _ = User.objects.get_or_create(username=f"faculty_{faculty.ShortName}")
            token, _       = Token.objects.get_or_create(user=django_user)
            return Response({'token': token.key, 'role': 'faculty', 'fullname': faculty.FullName, 'shortname': faculty.ShortName, 'subject': faculty.Subject, 'mobile': faculty.MoNumber})
    except Faculty.DoesNotExist:
        pass

    # Check Student
    try:
        student = Student.objects.get(Enroll__iexact=username)
        if _check_pass(password, student.Pass):
            django_user, _ = User.objects.get_or_create(username=f"student_{student.Enroll}")
            token, _       = Token.objects.get_or_create(user=django_user)
            return Response({'token': token.key, 'role': 'student', 'enroll': student.Enroll, 'name': student.Name, 'rollno': student.RollNo, 'div': student.Div, 'branch': student.Branch})
    except Student.DoesNotExist:
        pass

    return Response({'error': 'No account found with these credentials.'},
                    status=status.HTTP_401_UNAUTHORIZED)


# ── Student Login ─────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def student_login(request):
    enroll   = request.data.get('enroll', '').strip()
    password = request.data.get('password', '').strip()

    if not enroll or not password:
        return Response({'error': 'Enrollment and password are required.'},
                        status=status.HTTP_400_BAD_REQUEST)

    try:
        student = Student.objects.get(Enroll=enroll)
    except Student.DoesNotExist:
        return Response({'error': 'Invalid enrollment number.'},
                        status=status.HTTP_401_UNAUTHORIZED)

    if not _check_pass(password, student.Pass):
        return Response({'error': 'Incorrect password.'},
                        status=status.HTTP_401_UNAUTHORIZED)

    # Issue a DRF token via a shadow Django User (one per student)
    django_user, _ = User.objects.get_or_create(username=f"student_{student.Enroll}")
    token, _       = Token.objects.get_or_create(user=django_user)

    return Response({
        'token':   token.key,
        'role':    'student',
        'enroll':  student.Enroll,
        'name':    student.Name,
        'rollno':  student.RollNo,
        'div':     student.Div,
        'branch':  student.Branch,
    })


# ── Faculty Login ─────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def faculty_login(request):
    shortname = request.data.get('shortname', '').strip()
    password  = request.data.get('password', '').strip()

    if not shortname or not password:
        return Response({'error': 'ShortName and password are required.'},
                        status=status.HTTP_400_BAD_REQUEST)

    try:
        faculty = Faculty.objects.get(ShortName__iexact=shortname)
    except Faculty.DoesNotExist:
        return Response({'error': 'Invalid short name.'},
                        status=status.HTTP_401_UNAUTHORIZED)

    if not _check_pass(password, faculty.Pass):
        return Response({'error': 'Incorrect password.'},
                        status=status.HTTP_401_UNAUTHORIZED)

    django_user, _ = User.objects.get_or_create(username=f"faculty_{faculty.ShortName}")
    token, _       = Token.objects.get_or_create(user=django_user)

    return Response({
        'token':     token.key,
        'role':      'faculty',
        'fullname':  faculty.FullName,
        'shortname': faculty.ShortName,
        'subject':   faculty.Subject,
        'mobile':    faculty.MoNumber,
    })


# ── Admin Login ───────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    adminname = request.data.get('adminname', '').strip()
    password  = request.data.get('password', '').strip()

    if not adminname or not password:
        return Response({'error': 'Adminname and password are required.'},
                        status=status.HTTP_400_BAD_REQUEST)

    try:
        admin = Admin.objects.get(Adminname__iexact=adminname)
    except Admin.DoesNotExist:
        return Response({'error': 'Invalid admin name.'},
                        status=status.HTTP_401_UNAUTHORIZED)

    if not _check_pass(password, admin.Password):
        return Response({'error': 'Incorrect password.'},
                        status=status.HTTP_401_UNAUTHORIZED)

    django_user, _ = User.objects.get_or_create(username=f"admin_{admin.Adminname}")
    token, _       = Token.objects.get_or_create(user=django_user)

    return Response({
        'token': token.key,
        'role':  'admin',
        'name':  admin.Adminname,
    })


# ── Logout (common) ───────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    request.user.auth_token.delete()
    return Response({'message': 'Logged out.'})


# ── Change Password ────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def change_password(request):
    username       = request.data.get('username', '').strip()
    old_password   = request.data.get('old_password', '').strip()
    new_password   = request.data.get('new_password', '').strip()
    requested_role = request.data.get('role', '').strip().lower()

    if not username and request.user and request.user.is_authenticated:
        uname = request.user.username
        if uname.startswith('admin_'):
            username = uname.replace('admin_', '', 1)
            if not requested_role: requested_role = 'admin'
        elif uname.startswith('faculty_'):
            username = uname.replace('faculty_', '', 1)
            if not requested_role: requested_role = 'faculty'
        elif uname.startswith('student_'):
            username = uname.replace('student_', '', 1)
            if not requested_role: requested_role = 'student'
        else:
            username = uname

    if not username or not old_password or not new_password:
        return Response({'error': 'Username, old password, and new password are required.'},
                        status=status.HTTP_400_BAD_REQUEST)

    # 1. Check Student role
    if requested_role == 'student':
        try:
            student = Student.objects.get(Enroll__iexact=username)
            if not _check_pass(old_password, student.Pass):
                return Response({'error': 'Incorrect old password.'},
                                status=status.HTTP_400_BAD_REQUEST)
            err = _validate_password(new_password, 'student')
            if err:
                return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)
            student.Pass = _hash_pass(new_password)
            student.save()

            django_user, _ = User.objects.get_or_create(username=f"student_{student.Enroll}")
            django_user.set_password(new_password)
            django_user.save()
            token, _ = Token.objects.get_or_create(user=django_user)
            return Response({'message': 'Password updated successfully.', 'token': token.key})
        except Student.DoesNotExist:
            return Response({'error': 'Invalid Student enrollment number or credentials.'},
                            status=status.HTTP_400_BAD_REQUEST)

    # 2. Check Faculty role
    elif requested_role == 'faculty':
        try:
            faculty = Faculty.objects.get(ShortName__iexact=username)
            if not _check_pass(old_password, faculty.Pass):
                return Response({'error': 'Incorrect old password.'},
                                status=status.HTTP_400_BAD_REQUEST)
            err = _validate_password(new_password, 'faculty')
            if err:
                return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)
            faculty.Pass = _hash_pass(new_password)
            faculty.save()

            django_user, _ = User.objects.get_or_create(username=f"faculty_{faculty.ShortName}")
            django_user.set_password(new_password)
            django_user.save()
            token, _ = Token.objects.get_or_create(user=django_user)
            return Response({'message': 'Password updated successfully.', 'token': token.key})
        except Faculty.DoesNotExist:
            return Response({'error': 'Invalid Faculty shortcode or credentials.'},
                            status=status.HTTP_400_BAD_REQUEST)

    # 3. Check Admin role
    elif requested_role == 'admin':
        try:
            admin = Admin.objects.get(Adminname__iexact=username)
            if not _check_pass(old_password, admin.Password):
                return Response({'error': 'Incorrect old password.'},
                                status=status.HTTP_400_BAD_REQUEST)
            err = _validate_password(new_password, 'admin')
            if err:
                return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)
            admin.Password = _hash_pass(new_password)
            admin.save()

            django_user, _ = User.objects.get_or_create(username=f"admin_{admin.Adminname}")
            django_user.set_password(new_password)
            django_user.save()
            token, _ = Token.objects.get_or_create(user=django_user)
            return Response({'message': 'Password updated successfully.', 'token': token.key})
        except Admin.DoesNotExist:
            return Response({'error': 'Invalid Admin username or credentials.'},
                            status=status.HTTP_400_BAD_REQUEST)

    # Fallback if no role specified:
    try:
        admin = Admin.objects.get(Adminname__iexact=username)
        if not _check_pass(old_password, admin.Password):
            return Response({'error': 'Incorrect old password.'}, status=status.HTTP_400_BAD_REQUEST)
        err = _validate_password(new_password, 'admin')
        if err:
            return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)
        admin.Password = _hash_pass(new_password)
        admin.save()
        django_user, _ = User.objects.get_or_create(username=f"admin_{admin.Adminname}")
        django_user.set_password(new_password)
        django_user.save()
        token, _ = Token.objects.get_or_create(user=django_user)
        return Response({'message': 'Password updated successfully.', 'token': token.key})
    except Admin.DoesNotExist:
        pass

    try:
        faculty = Faculty.objects.get(ShortName__iexact=username)
        if not _check_pass(old_password, faculty.Pass):
            return Response({'error': 'Incorrect old password.'}, status=status.HTTP_400_BAD_REQUEST)
        err = _validate_password(new_password, 'faculty')
        if err:
            return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)
        faculty.Pass = _hash_pass(new_password)
        faculty.save()
        django_user, _ = User.objects.get_or_create(username=f"faculty_{faculty.ShortName}")
        django_user.set_password(new_password)
        django_user.save()
        token, _ = Token.objects.get_or_create(user=django_user)
        return Response({'message': 'Password updated successfully.', 'token': token.key})
    except Faculty.DoesNotExist:
        pass

    try:
        student = Student.objects.get(Enroll__iexact=username)
        if not _check_pass(old_password, student.Pass):
            return Response({'error': 'Incorrect old password.'}, status=status.HTTP_400_BAD_REQUEST)
        err = _validate_password(new_password, 'student')
        if err:
            return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)
        student.Pass = _hash_pass(new_password)
        student.save()

        django_user, _ = User.objects.get_or_create(username=f"student_{student.Enroll}")
        django_user.set_password(new_password)
        django_user.save()
        token, _ = Token.objects.get_or_create(user=django_user)
        return Response({'message': 'Password updated successfully.', 'token': token.key})
    except Student.DoesNotExist:
        pass

    return Response({'error': 'User not found in database.'}, status=status.HTTP_404_NOT_FOUND)


# ── Notes ─────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notes_list(request):
    sem       = request.query_params.get('sem') or request.query_params.get('semester')
    phase     = request.query_params.get('faze') or request.query_params.get('phase')
    shortname = request.query_params.get('shortname') or request.query_params.get('faculty_shortname')

    qs = Notes.objects.select_related('Faculty').all()
    if sem:
        qs = qs.filter(Sem=sem)
    if phase:
        qs = qs.filter(Faze=phase)
    if shortname and shortname.upper() != 'ALL':
        qs = qs.filter(Faculty__ShortName__iexact=shortname)

    data = [
        {
            'id':            n.id,
            'sem':           n.Sem,
            'faze':          n.Faze,
            'faculty':       n.Faculty.FullName,
            'shortname':     n.Faculty.ShortName,
            'uploaded_by':   n.Faculty.ShortName,
            'file_url':      request.build_absolute_uri(n.Note.url) if n.Note else '',
            'file_name':     os.path.basename(n.Note.name) if n.Note else '',
            'original_name': os.path.basename(n.Note.name) if n.Note else '',
            'size':          _format_size(n.Note.size) if (n.Note and hasattr(n.Note, 'size')) else '—',
        }
        for n in qs
    ]
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notes_upload(request):
    sem       = request.data.get('sem') or request.data.get('semester')
    faze      = request.data.get('faze') or request.data.get('phase')
    fac_id    = request.data.get('faculty_id') or request.data.get('fac_id')
    shortname = request.data.get('shortname') or request.data.get('faculty_shortname')
    file      = request.FILES.get('file')

    if not all([sem, faze, file]):
        return Response({'error': 'semester, phase and file are required.'},
                        status=status.HTTP_400_BAD_REQUEST)

    # Automatically identify faculty from session, request user, shortname, or fac_id
    faculty = None
    if request.user and request.user.is_authenticated and request.user.username.startswith('faculty_'):
        uname = request.user.username.replace('faculty_', '', 1)
        faculty = Faculty.objects.filter(ShortName__iexact=uname).first()

    if not faculty and shortname:
        faculty = Faculty.objects.filter(ShortName__iexact=shortname).first()

    if not faculty and fac_id:
        faculty = Faculty.objects.filter(id=fac_id).first()

    if not faculty:
        faculty = Faculty.objects.first()

    if not faculty:
        return Response({'error': 'Faculty profile not found in database.'}, status=status.HTTP_404_NOT_FOUND)

    note = Notes.objects.create(
        Sem     = int(sem),
        Faze    = int(faze),
        Faculty = faculty,
        Note    = file,
    )

    # Trigger real-time notifications for students
    all_students = Student.objects.all()
    for s in all_students:
        create_notification(
            recipient_role='student',
            recipient_id=s.Enroll,
            title='New Notes Uploaded 📚',
            message=f"{faculty.FullName} ({faculty.ShortName}) uploaded notes for Sem-{sem} Phase-{faze}.",
            link='/notes'
        )


    return Response({
        'id':            note.id,
        'sem':           note.Sem,
        'faze':          note.Faze,
        'faculty':       faculty.FullName,
        'shortname':     faculty.ShortName,
        'uploaded_by':   faculty.ShortName,
        'file_url':      request.build_absolute_uri(note.Note.url),
        'file_name':     os.path.basename(note.Note.name),
        'original_name': os.path.basename(note.Note.name),
        'size':          _format_size(note.Note.size),
    }, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def notes_delete(request, note_id):
    try:
        note = Notes.objects.get(id=note_id)
    except Notes.DoesNotExist:
        return Response({'error': 'Note not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Determine requesting user role & faculty identity
    requesting_shortname = None
    if request.user and request.user.is_authenticated:
        uname = request.user.username
        if uname.startswith('faculty_'):
            requesting_shortname = uname.replace('faculty_', '', 1)
        elif uname.startswith('admin_'):
            requesting_shortname = 'ADMIN'  # Admin has override permission

    if not requesting_shortname:
        requesting_shortname = request.query_params.get('shortname') or request.data.get('shortname')

    if requesting_shortname != 'ADMIN':
        if not requesting_shortname or note.Faculty.ShortName.upper() != requesting_shortname.upper():
            return Response(
                {'error': 'Permission denied: You can only delete notes that you uploaded yourself.'},
                status=status.HTTP_403_FORBIDDEN
            )

    if note.Note and os.path.isfile(note.Note.path):
        os.remove(note.Note.path)

    note.delete()
    return Response({'message': 'Note deleted successfully.'})



# ── Doubt ─────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doubt_list(request):
    enroll     = request.query_params.get('enroll')
    faculty_id = request.query_params.get('faculty_id')
    shortname  = request.query_params.get('shortname')
    status_filter = request.query_params.get('status')

    qs = Doubt.objects.select_related('Faculty').all()
    if enroll:
        qs = qs.filter(Enroll=enroll)
    if faculty_id:
        qs = qs.filter(Faculty__id=faculty_id)
    if shortname:
        qs = qs.filter(Faculty__ShortName__iexact=shortname)
    if status_filter:
        qs = qs.filter(status=status_filter)

    data = [
        {
            'id':             d.id,
            'enroll':         d.Enroll or '',
            'name':           d.Name or '',
            'batch':          d.Batch or '',
            'sub':            d.Sub or '',
            'faculty_id':     d.Faculty.id if d.Faculty else None,
            'faculty':        d.Faculty.FullName if d.Faculty else 'Faculty Unavailable',
            'shortname':      d.Faculty.ShortName if d.Faculty else 'N/A',
            'doubt':          d.Doubt or '',
            'photo':          request.build_absolute_uri(d.Photo.url) if d.Photo else None,
            'status':         d.status or 'pending',
            'solution':       d.Solution or '',
            'solution_photo': request.build_absolute_uri(d.SolutionPhoto.url) if d.SolutionPhoto else None,
            'created_at':     d.created_at.strftime('%d %b %Y, %I:%M %p') if d.created_at else '',
        }
        for d in qs
    ]
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def doubt_submit(request):
    required = ['enroll', 'name', 'batch', 'sub', 'faculty_id', 'doubt']
    for field in required:
        if not request.data.get(field):
            return Response({'error': f'{field} is required.'},
                            status=status.HTTP_400_BAD_REQUEST)

    try:
        faculty = Faculty.objects.get(id=request.data['faculty_id'])
    except Faculty.DoesNotExist:
        return Response({'error': 'Faculty not found.'}, status=status.HTTP_404_NOT_FOUND)

    doubt = Doubt.objects.create(
        Enroll  = request.data['enroll'],
        Name    = request.data['name'],
        Batch   = request.data['batch'],
        Sub     = request.data['sub'],
        Faculty = faculty,
        Doubt   = request.data['doubt'],
        Photo   = request.FILES.get('photo'),
        status  = 'pending',
    )

    # Trigger notification to faculty
    create_notification(
        recipient_role='faculty',
        recipient_id=faculty.ShortName,
        title='New Doubt Received ❓',
        message=f"Student {doubt.Name} ({doubt.Enroll}) asked a doubt in {doubt.Sub}.",
        link='/solve-doubt'
    )



    return Response({'id': doubt.id, 'status': doubt.status, 'message': 'Doubt raised successfully!'}, status=status.HTTP_201_CREATED)


@api_view(['POST', 'PATCH'])
@permission_classes([IsAuthenticated])
def doubt_solve(request, doubt_id):
    try:
        doubt = Doubt.objects.get(id=doubt_id)
    except Doubt.DoesNotExist:
        return Response({'error': 'Doubt not found.'}, status=status.HTTP_404_NOT_FOUND)

    solution_text = request.data.get('solution') or request.data.get('answer') or ''
    solution_photo = request.FILES.get('photo') or request.FILES.get('solution_photo')

    doubt.Solution = solution_text
    if solution_photo:
        doubt.SolutionPhoto = solution_photo
    doubt.status = 'solved'
    doubt.save()

    # Trigger notification to student
    create_notification(
        recipient_role='student',
        recipient_id=doubt.Enroll,
        title='Doubt Solved! ✅',
        message=f"Faculty {doubt.Faculty.FullName} ({doubt.Faculty.ShortName}) solved your doubt in {doubt.Sub}.",
        link='/doubt'
    )


    return Response({
        'id':             doubt.id,
        'status':         doubt.status,
        'solution':       doubt.Solution,
        'solution_photo': request.build_absolute_uri(doubt.SolutionPhoto.url) if doubt.SolutionPhoto else None,
        'message':        'Doubt solved successfully!'
    })


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def doubt_status_update(request, doubt_id):
    return doubt_solve(request, doubt_id)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def doubt_delete(request, doubt_id):
    try:
        doubt = Doubt.objects.get(id=doubt_id)
    except Doubt.DoesNotExist:
        return Response({'error': 'Doubt not found.'}, status=status.HTTP_404_NOT_FOUND)

    if doubt.Photo and os.path.isfile(doubt.Photo.path):
        try:
            os.remove(doubt.Photo.path)
        except OSError:
            pass

    if doubt.SolutionPhoto and os.path.isfile(doubt.SolutionPhoto.path):
        try:
            os.remove(doubt.SolutionPhoto.path)
        except OSError:
            pass

    doubt.delete()
    return Response({'message': 'Doubt deleted successfully.'})




# ── Solve ─────────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def solve_create(request):
    required = ['faculty_name', 'shortname', 'subject', 'answer']
    for field in required:
        if not request.data.get(field):
            return Response({'error': f'{field} is required.'},
                            status=status.HTTP_400_BAD_REQUEST)

    solve = Solve.objects.create(
        FacultyName = request.data['faculty_name'],
        ShortName   = request.data['shortname'],
        Subject     = request.data['subject'],
        Answer      = request.data['answer'],
        Photo       = request.FILES.get('photo'),
    )
    return Response({'id': solve.id}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def solve_list(request):
    qs = Solve.objects.all()
    data = [
        {
            'id':          s.id,
            'faculty_name': s.FacultyName,
            'shortname':   s.ShortName,
            'subject':     s.Subject,
            'answer':      s.Answer,
            'photo':       request.build_absolute_uri(s.Photo.url) if s.Photo else None,
        }
        for s in qs
    ]
    return Response(data)


# ── Faculty list (for dropdowns) ──────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def faculty_list(request):
    data = [
        {'id': f.id, 'fullname': f.FullName, 'shortname': f.ShortName, 'subject': f.Subject}
        for f in Faculty.objects.all()
    ]
    return Response(data)


# ── Admin: Add Student ────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_add_student(request):
    required = ['RollNo', 'Enroll', 'Name', 'Div', 'Branch', 'Pass']
    for field in required:
        if not request.data.get(field):
            return Response({'error': f'{field} is required.'},
                            status=status.HTTP_400_BAD_REQUEST)

    if Student.objects.filter(Enroll=request.data['Enroll']).exists():
        return Response({'error': 'Student with this Enrollment already exists.'},
                        status=status.HTTP_400_BAD_REQUEST)
    if Student.objects.filter(RollNo=request.data['RollNo'], Div=request.data['Div']).exists():
        return Response({'error': f"Student with Roll No {request.data['RollNo']} already exists in Division {request.data['Div']}."},
                        status=status.HTTP_400_BAD_REQUEST)

    student = Student.objects.create(
        RollNo = request.data['RollNo'],
        Enroll = request.data['Enroll'],
        Name   = request.data['Name'],
        Div    = request.data['Div'],
        Branch = request.data['Branch'],
        Pass   = _hash_pass(request.data['Pass']),
    )
    return Response({'id': student.id, 'message': 'Student added successfully.'},
                    status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_add_student_csv(request):
    """Bulk-add students from a CSV file.
    Expected CSV columns (header row required):
    RollNo, Enroll, Name, Div, Branch, Pass
    """
    import csv, io
    file = request.FILES.get('file')
    if not file:
        return Response({'error': 'CSV file is required.'}, status=status.HTTP_400_BAD_REQUEST)

    decoded = file.read().decode('utf-8-sig')
    reader  = csv.DictReader(io.StringIO(decoded))
    created, skipped, errors = 0, 0, []

    for i, row in enumerate(reader, start=2):
        try:
            rollno = row.get('RollNo', '').strip()
            enroll = row.get('Enroll', '').strip()
            name   = row.get('Name',   '').strip()
            div    = row.get('Div',    '').strip()
            branch = row.get('Branch', '').strip()
            pwd    = row.get('Pass',   '').strip()

            if not all([rollno, enroll, name, div, branch, pwd]):
                errors.append(f'Row {i}: missing field(s).')
                continue

            if Student.objects.filter(Enroll=enroll).exists() or \
               Student.objects.filter(RollNo=rollno, Div=div).exists():
                skipped += 1
                continue


            Student.objects.create(
                RollNo=rollno, Enroll=enroll, Name=name,
                Div=div, Branch=branch, Pass=_hash_pass(pwd)
            )
            created += 1
        except Exception as e:
            errors.append(f'Row {i}: {str(e)}')

    return Response({
        'created': created,
        'skipped': skipped,
        'errors':  errors,
    }, status=status.HTTP_201_CREATED)


# ── Admin: Add Faculty ────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_add_faculty(request):
    required = ['FullName', 'ShortName', 'Subject', 'MoNumber', 'Pass']
    for field in required:
        if not request.data.get(field):
            return Response({'error': f'{field} is required.'},
                            status=status.HTTP_400_BAD_REQUEST)

    shortname = request.data['ShortName'].strip().upper()
    if Faculty.objects.filter(ShortName=shortname).exists():
        return Response({'error': 'Faculty with this ShortName already exists.'},
                        status=status.HTTP_400_BAD_REQUEST)

    faculty = Faculty.objects.create(
        FullName  = request.data['FullName'],
        ShortName = shortname,
        Subject   = request.data['Subject'],
        MoNumber  = request.data['MoNumber'],
        Pass      = _hash_pass(request.data['Pass']),
    )
    return Response({'id': faculty.id, 'message': 'Faculty added successfully.'},
                    status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_add_faculty_csv(request):
    """Bulk-add faculty from a CSV file.
    Expected CSV columns (header row required):
    FullName, ShortName, Subject, MoNumber, Pass
    """
    import csv, io
    file = request.FILES.get('file')
    if not file:
        return Response({'error': 'CSV file is required.'}, status=status.HTTP_400_BAD_REQUEST)

    decoded = file.read().decode('utf-8-sig')
    reader  = csv.DictReader(io.StringIO(decoded))
    created, skipped, errors = 0, 0, []

    for i, row in enumerate(reader, start=2):
        try:
            fullname  = row.get('FullName',  '').strip()
            shortname = row.get('ShortName', '').strip()
            subject   = row.get('Subject',   '').strip()
            mobile    = row.get('MoNumber',  '').strip()
            pwd       = row.get('Pass',      '').strip()

            if not all([fullname, shortname, subject, mobile, pwd]):
                errors.append(f'Row {i}: missing field(s).')
                continue

            if Faculty.objects.filter(ShortName=shortname).exists():
                skipped += 1
                continue

            Faculty.objects.create(
                FullName=fullname, ShortName=shortname,
                Subject=subject, MoNumber=mobile, Pass=_hash_pass(pwd)
            )
            created += 1
        except Exception as e:
            errors.append(f'Row {i}: {str(e)}')

    return Response({
        'created': created,
        'skipped': skipped,
        'errors':  errors,
    }, status=status.HTTP_201_CREATED)


# ── Helper ────────────────────────────────────────────────────────────────────

def _format_size(bytes_val):
    if bytes_val < 1024:
        return f"{bytes_val} B"
    elif bytes_val < 1024 * 1024:
        return f"{bytes_val / 1024:.1f} KB"
    else:
        return f"{bytes_val / (1024 * 1024):.1f} MB"


# ── Notifications API ─────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notifications_list(request):
    user = request.user
    role = None
    recipient_id = None

    if user.username.startswith('student_'):
        role = 'student'
        recipient_id = user.username.replace('student_', '', 1)
    elif user.username.startswith('faculty_'):
        role = 'faculty'
        recipient_id = user.username.replace('faculty_', '', 1)
    elif user.username.startswith('admin_'):
        role = 'admin'
        recipient_id = 'admin'
    else:
        role = request.query_params.get('role')
        recipient_id = request.query_params.get('recipient_id')

    if not role or not recipient_id:
        return Response({'unread_count': 0, 'notifications': []})

    qs = Notification.objects.filter(
        recipient_role__iexact=role,
        recipient_id__iexact=recipient_id
    )[:30]

    unread_count = Notification.objects.filter(
        recipient_role__iexact=role,
        recipient_id__iexact=recipient_id,
        is_read=False
    ).count()

    data = [
        {
            'id': n.id,
            'title': n.title,
            'message': n.message,
            'link': n.link,
            'is_read': n.is_read,
            'created_at': n.created_at.strftime('%b %d, %I:%M %p'),
        }
        for n in qs
    ]

    return Response({
        'unread_count': unread_count,
        'notifications': data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notification_mark_read(request, pk):
    try:
        n = Notification.objects.get(id=pk)
        n.is_read = True
        n.save()
        return Response({'message': 'Notification marked as read.'})
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notifications_mark_all_read(request):
    user = request.user
    role = None
    recipient_id = None

    if user.username.startswith('student_'):
        role = 'student'
        recipient_id = user.username.replace('student_', '', 1)
    elif user.username.startswith('faculty_'):
        role = 'faculty'
        recipient_id = user.username.replace('faculty_', '', 1)
    elif user.username.startswith('admin_'):
        role = 'admin'
        recipient_id = 'admin'

    if role and recipient_id:
        Notification.objects.filter(
            recipient_role__iexact=role,
            recipient_id__iexact=recipient_id,
            is_read=False
        ).update(is_read=True)

    return Response({'message': 'All notifications marked as read.'})


# ── Analytics API ─────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_data(request):
    total_students = Student.objects.count()
    total_faculty  = Faculty.objects.count()
    total_notes    = Notes.objects.count()
    total_doubts   = Doubt.objects.count()
    solved_doubts  = Doubt.objects.filter(status='solved').count()
    pending_doubts = Doubt.objects.filter(status='pending').count()

    resolution_rate = round((solved_doubts / total_doubts * 100), 1) if total_doubts > 0 else 0.0

    from django.db.models import Count
    subject_counts = Doubt.objects.values('Sub').annotate(count=Count('id')).order_by('-count')[:5]
    subject_breakdown = [{'subject': item['Sub'] or 'General', 'count': item['count']} for item in subject_counts]

    return Response({
        'total_students': total_students,
        'total_faculty':  total_faculty,
        'total_notes':    total_notes,
        'total_doubts':   total_doubts,
        'solved_doubts':  solved_doubts,
        'pending_doubts': pending_doubts,
        'resolution_rate': resolution_rate,
        'subject_breakdown': subject_breakdown,
    })

# ── Faculty Doubt Stats API (Admin) ───────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def faculty_doubt_stats(request):
    """Return per-faculty solved / pending / total doubt counts + 3-hour reminder availability + doubts list."""
    from django.utils import timezone
    now = timezone.now()

    faculties = Faculty.objects.all()
    result = []

    for fac in faculties:
        total   = Doubt.objects.filter(Faculty=fac).count()
        solved  = Doubt.objects.filter(Faculty=fac, status='solved').count()
        pending = Doubt.objects.filter(Faculty=fac, status='pending').count()
        rate    = round((solved / total * 100), 1) if total > 0 else 0.0

        # Find oldest pending doubt for this faculty
        oldest_pending = Doubt.objects.filter(Faculty=fac, status='pending').order_by('id').first()
        can_remind = False
        oldest_hours = 0.0

        if oldest_pending:
            if hasattr(oldest_pending, 'created_at') and oldest_pending.created_at:
                diff_sec = (now - oldest_pending.created_at).total_seconds()
                oldest_hours = round(diff_sec / 3600, 1)
                can_remind = oldest_hours >= 3.0
            else:
                can_remind = True
                oldest_hours = 3.0

        doubts_qs = Doubt.objects.filter(Faculty=fac).order_by('-id')
        doubts_list = [
            {
                'id': d.id,
                'enroll': d.Enroll,
                'name': d.Name,
                'sub': d.Sub,
                'doubt': d.Doubt,
                'status': d.status,
                'solution': d.Solution,
                'created_at': d.created_at.strftime('%b %d, %I:%M %p') if (hasattr(d, 'created_at') and d.created_at) else 'N/A',
                'hours_pending': round((now - d.created_at).total_seconds() / 3600, 1) if (hasattr(d, 'created_at') and d.created_at) else 3.0,
            }
            for d in doubts_qs
        ]

        result.append({
            'id':                fac.id,
            'fullname':          fac.FullName,
            'shortname':         fac.ShortName,
            'subject':           fac.Subject,
            'total_doubts':      total,
            'solved_doubts':     solved,
            'pending_doubts':    pending,
            'resolution_rate':   rate,
            'can_remind':        can_remind,
            'oldest_hours':      oldest_hours,
            'doubts':            doubts_list,
        })

    # Sort: faculties with pending doubts first, then by most assigned
    result.sort(key=lambda x: (-x['pending_doubts'], -x['total_doubts']))
    return Response(result)


# ── Admin Send Reminder to Faculty ────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_send_reminder(request):
    """Admin sends a reminder notification to a faculty with pending doubts."""
    shortname = request.data.get('shortname', '').strip()
    message   = request.data.get('message', '').strip()

    if not shortname:
        return Response({'error': 'Faculty shortname is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        faculty = Faculty.objects.get(ShortName__iexact=shortname)
    except Faculty.DoesNotExist:
        return Response({'error': 'Faculty not found.'}, status=status.HTTP_404_NOT_FOUND)

    pending_count = Doubt.objects.filter(Faculty=faculty, status='pending').count()

    default_msg = (
        message if message
        else f"You have {pending_count} unresolved doubt(s). Please resolve them at the earliest."
    )

    create_notification(
        recipient_role='faculty',
        recipient_id=faculty.ShortName,
        title='⚠️ Admin Reminder',
        message=default_msg,
        link='/solve-doubt'
    )

    return Response({
        'success': True,
        'message': f'Reminder sent to {faculty.FullName} ({faculty.ShortName}).',
    })


# ── Doubt Comments / Threading API ────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def doubt_comments_list_create(request, doubt_id):
    try:
        doubt = Doubt.objects.get(id=doubt_id)
    except Doubt.DoesNotExist:
        return Response({'error': 'Doubt not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        comments = doubt.comments.all()
        data = [
            {
                'id':          c.id,
                'sender_role': c.sender_role,
                'sender_name': c.sender_name,
                'comment':     c.comment,
                'created_at':  c.created_at.strftime('%b %d, %I:%M %p'),
            }
            for c in comments
        ]
        return Response(data)

    elif request.method == 'POST':
        comment_text = request.data.get('comment', '').strip()
        if not comment_text:
            return Response({'error': 'Comment text is required.'}, status=status.HTTP_400_BAD_REQUEST)

        sender_role = 'student'
        sender_name = request.data.get('sender_name') or 'User'

        if request.user and request.user.username.startswith('faculty_'):
            sender_role = 'faculty'
            shortname = request.user.username.replace('faculty_', '', 1)
            fac = Faculty.objects.filter(ShortName__iexact=shortname).first()
            if fac:
                sender_name = fac.FullName
        elif request.user and request.user.username.startswith('student_'):
            sender_role = 'student'
            enroll = request.user.username.replace('student_', '', 1)
            st = Student.objects.filter(Enroll__iexact=enroll).first()
            if st:
                sender_name = st.Name

        comment_obj = DoubtComment.objects.create(
            doubt=doubt,
            sender_role=sender_role,
            sender_name=sender_name,
            comment=comment_text,
        )

        if sender_role == 'student':
            create_notification(
                recipient_role='faculty',
                recipient_id=doubt.Faculty.ShortName,
                title='New Follow-up Comment 💬',
                message=f"{sender_name} commented on doubt in {doubt.Sub}.",
                link='/solve-doubt'
            )
        else:
            create_notification(
                recipient_role='student',
                recipient_id=doubt.Enroll,
                title='Faculty Replied to Comment 💬',
                message=f"{sender_name} replied to your doubt thread in {doubt.Sub}.",
                link='/doubt'
            )

        return Response({
            'id':          comment_obj.id,
            'sender_role': comment_obj.sender_role,
            'sender_name': comment_obj.sender_name,
            'comment':     comment_obj.comment,
            'created_at':  comment_obj.created_at.strftime('%b %d, %I:%M %p'),
        }, status=status.HTTP_201_CREATED)


# ── Admin: Delete Student ──────────────────────────────────────────────────────

@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_delete_student(request):
    """Search or Delete student by Enrollment number."""
    if request.method == 'GET':
        enroll = request.query_params.get('enroll', '').strip()
        if not enroll:
            return Response({'error': 'Enrollment number is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            student = Student.objects.get(Enroll__iexact=enroll)
            return Response({
                'id': student.id,
                'enroll': student.Enroll,
                'name': student.Name,
                'rollno': student.RollNo,
                'div': student.Div,
                'branch': student.Branch,
            })
        except Student.DoesNotExist:
            return Response({'error': f'No student found with enrollment "{enroll}".'}, status=status.HTTP_404_NOT_FOUND)

    # POST or DELETE -> Delete student
    enroll = (request.data.get('enroll') or request.query_params.get('enroll') or '').strip()
    if not enroll:
        return Response({'error': 'Enrollment number is required for deletion.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        student = Student.objects.get(Enroll__iexact=enroll)
        student_name = student.Name
        student_enroll = student.Enroll
        student.delete()
        # Remove associated Django User token shadow user if exists
        User.objects.filter(username=f"student_{student_enroll}").delete()
        return Response({'message': f'Student {student_name} ({student_enroll}) deleted successfully.'})
    except Student.DoesNotExist:
        return Response({'error': f'No student found with enrollment "{enroll}".'}, status=status.HTTP_404_NOT_FOUND)


# ── Admin: Delete Faculty ──────────────────────────────────────────────────────

@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_delete_faculty(request):
    """Search or Delete faculty by Shortcode."""
    if request.method == 'GET':
        shortname = request.query_params.get('shortname', '').strip()
        if not shortname:
            return Response({'error': 'Faculty Shortcode is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            faculty = Faculty.objects.get(ShortName__iexact=shortname)
            return Response({
                'id': faculty.id,
                'shortname': faculty.ShortName,
                'fullname': faculty.FullName,
                'subject': faculty.Subject,
                'mobile': faculty.MoNumber,
            })
        except Faculty.DoesNotExist:
            return Response({'error': f'No faculty found with shortcode "{shortname}".'}, status=status.HTTP_404_NOT_FOUND)

    # POST or DELETE -> Delete faculty
    shortname = (request.data.get('shortname') or request.query_params.get('shortname') or '').strip()
    if not shortname:
        return Response({'error': 'Faculty Shortcode is required for deletion.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        faculty = Faculty.objects.get(ShortName__iexact=shortname)
        fac_name = faculty.FullName
        fac_code = faculty.ShortName
        faculty.delete()
        # Remove associated Django User token shadow user if exists
        User.objects.filter(username=f"faculty_{fac_code}").delete()
        return Response({'message': f'Faculty {fac_name} ({fac_code}) deleted successfully.'})
    except Faculty.DoesNotExist:
        return Response({'error': f'No faculty found with shortcode "{shortname}".'}, status=status.HTTP_404_NOT_FOUND)


