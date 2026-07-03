from django.urls import path
from . import views

app_name = 'predictions'

urlpatterns = [
    path('', views.predictions_home, name='home'),
    path('diabetes/', views.diabetes_view, name='diabetes'),
    path('heart/', views.heart_view, name='heart'),
    path('liver/', views.liver_view, name='liver'),
    path('bmi/', views.bmi_prediction, name='bmi'),
    path('kidney/', views.kidney_prediction, name='kidney'),
    path('skin/', views.skin_prediction, name='skin'),
    path('prescription-ocr/', views.prescription_ocr_prediction, name='prescription_ocr'),
    path('lung/', views.lung_prediction, name='lung'),
    path('prescription/', views.prescription_prediction, name='prescription'),
]
