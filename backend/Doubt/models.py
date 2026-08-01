from django.db import models


class Student(models.Model):
    RollNo  = models.CharField(max_length=20)
    Enroll  = models.CharField(max_length=50, unique=True)
    Name    = models.CharField(max_length=100)
    Div     = models.CharField(max_length=10)
    Branch  = models.CharField(max_length=100)
    Pass    = models.CharField(max_length=128)  # store hashed password


    def __str__(self):
        return f"{self.Name} ({self.Enroll})"


class Faculty(models.Model):
    FullName  = models.CharField(max_length=100)
    ShortName = models.CharField(max_length=20)
    Subject   = models.CharField(max_length=100)
    MoNumber  = models.CharField(max_length=15)
    Pass      = models.CharField(max_length=128)  # store hashed password

    def __str__(self):
        return f"{self.FullName} ({self.ShortName})"


class Notes(models.Model):
    Sem     = models.IntegerField()
    Faze    = models.IntegerField()
    Faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='notes')
    Note    = models.FileField(upload_to='notes/%Y/%m/')

    class Meta:
        ordering = ['-id']
        verbose_name_plural = 'Notes'

    def __str__(self):
        return f"Sem-{self.Sem} Phase-{self.Faze} by {self.Faculty.ShortName}"


class Doubt(models.Model):
    STATUS_CHOICES = [
        ('pending',  'Pending'),
        ('solved',   'Solved'),
    ]

    Enroll        = models.CharField(max_length=50)
    Name          = models.CharField(max_length=100)
    Batch         = models.CharField(max_length=20)
    Sub           = models.CharField(max_length=100)
    Faculty       = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='doubts')
    Doubt         = models.TextField()
    Photo         = models.ImageField(upload_to='doubts/', blank=True, null=True)
    status        = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    Solution      = models.TextField(blank=True, null=True)
    SolutionPhoto = models.ImageField(upload_to='solutions/', blank=True, null=True)
    created_at    = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def __str__(self):
        return f"{self.Name} — {self.Sub} [{self.status}]"



class Solve(models.Model):
    FacultyName = models.CharField(max_length=100)
    ShortName   = models.CharField(max_length=20)
    Subject     = models.CharField(max_length=100)
    Answer      = models.TextField()
    Photo       = models.ImageField(upload_to='solve/', blank=True, null=True)

    def __str__(self):
        return f"{self.FacultyName} — {self.Subject}"


class Admin(models.Model):
    Adminname = models.CharField(max_length=100, unique=True)
    Password  = models.CharField(max_length=128)  # store hashed password

    def __str__(self):
        return self.Adminname


class Notification(models.Model):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('faculty', 'Faculty'),
        ('admin',   'Admin'),
    ]

    recipient_role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    recipient_id   = models.CharField(max_length=50)  # Enroll, ShortName, or 'admin'
    title          = models.CharField(max_length=200)
    message        = models.TextField()
    link           = models.CharField(max_length=200, blank=True, null=True)
    is_read        = models.BooleanField(default=False)
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.recipient_role}:{self.recipient_id}] {self.title}"


class DoubtComment(models.Model):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('faculty', 'Faculty'),
    ]

    doubt       = models.ForeignKey(Doubt, on_delete=models.CASCADE, related_name='comments')
    sender_role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    sender_name = models.CharField(max_length=100)
    comment     = models.TextField()
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender_name} ({self.sender_role}) on Doubt #{self.doubt.id}"


