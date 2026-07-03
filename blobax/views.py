from django.conf import settings
from django.contrib import messages
from django.core.mail import send_mail
from django.shortcuts import redirect, render
from django.urls import reverse


def home(request):
    contact_sent = request.GET.get('sent') == '1'
    contact_error = False

    if request.method == 'POST' and 'sender_email' in request.POST:
        sender_name = request.POST.get('sender_name', '').strip()
        sender_email = request.POST.get('sender_email', '').strip()
        subject = request.POST.get('subject', '').strip()
        body = request.POST.get('body', '').strip()
        if sender_name and sender_email and subject and body:
            try:
                send_mail(
                    subject=f'[BloBax Contact] {subject}',
                    message=f'From: {sender_name} <{sender_email}>\n\n{body}',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[settings.CONTACT_RECIPIENT_EMAIL],
                    fail_silently=False,
                )
                return redirect(f"{reverse('home')}?sent=1#contact")
            except Exception as exc:
                contact_error = True
                if settings.DEBUG:
                    messages.error(request, f'Could not send message: {exc}')
                else:
                    messages.error(
                        request,
                        'Could not send message. Check EMAIL_HOST_USER and EMAIL_HOST_PASSWORD in .env.',
                    )
        else:
            messages.error(request, 'Please fill in all contact fields.')

    return render(request, 'home.html', {
        'contact_sent': contact_sent,
        'contact_error': contact_error,
    })


def contact_view(request):
    """POST handler alias — redirects to home contact section."""
    if request.method == 'POST':
        return home(request)
    return redirect(reverse('home') + '#contact')


def privacy(request):
    return render(request, 'pages/privacy.html')


def terms(request):
    return render(request, 'pages/terms.html')
