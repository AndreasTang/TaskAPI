const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY)

sgMail.send({
    to: '0114078@nkust.',
    from: '',
    subject: '',
    text: ''
})