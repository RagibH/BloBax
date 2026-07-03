from django.db import models
from django.contrib.auth.models import User


class PredictionHistory(models.Model):
    PREDICTION_TYPES = [
        ('bmi', 'BMI Prediction'),
        ('diabetes', 'Diabetes Prediction'),
        ('heart', 'Heart Disease Prediction'),
        ('liver', 'Liver Disease Prediction'),
        ('kidney', 'Kidney Disease Prediction'),
        ('prescription', 'Prescription Recognition'),
        ('medicine', 'Medicine Classification'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    prediction_type = models.CharField(max_length=20, choices=PREDICTION_TYPES)
    input_data = models.JSONField()
    result = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.prediction_type} - {self.created_at}"


class Prediction(models.Model):
    TYPES = [
        ('diabetes', 'Diabetes'),
        ('heart', 'Heart Disease'),
        ('liver', 'Liver Disease'),
        ('bmi', 'BMI'),
        ('medicine', 'Medicine'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='predictions')
    prediction_type = models.CharField(max_length=20, choices=TYPES)
    result = models.CharField(max_length=100)
    probability = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} — {self.prediction_type} — {self.result}"
