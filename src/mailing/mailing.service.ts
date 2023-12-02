import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { google } from 'googleapis';
import { Options } from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailingService {
    constructor(
        private readonly configService: ConfigService,
        private readonly mailerService: MailerService,
    ) {}

    private async setTransport() {
        const OAuth2 = google.auth.OAuth2;
        const oauth2Client = new OAuth2(
        this.configService.get('CLIENT_ID'),
        this.configService.get('CLIENT_SECRET'),
        'https://developers.google.com/oauthplayground',
        );

        oauth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN,
        });

        const accessToken: string = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
            if (err) {
            reject('Failed to create access token');
            }
            resolve(token);
        });
        });

        const config: Options = {
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: this.configService.get('EMAIL'),
            clientId: this.configService.get('CLIENT_ID'),
            clientSecret: this.configService.get('CLIENT_SECRET'),
            accessToken,
        },
        };
        this.mailerService.addTransporter('gmail', config);
    }
    public async sendResetEmail(email: string, resetLink: string): Promise<void> {
        await this.setTransport();
        await this.mailerService.sendMail({
            transporterName: 'gmail',
            to: email,
            from: 'no-reply@gmail.com',
            subject: 'Reset Your Matcha Password',
            template: 'action',
            html: `Click this <a href="${resetLink}">link</a> to reset your password.`,
        })
        .catch((err) => {
            console.log(err);
        });;
    }
    public async sendActivationCode(email: string, activationCode: string): Promise<void> {
        await this.setTransport();
        await this.mailerService.sendMail({
            transporterName: 'gmail',
            to: email,
            from: 'no-reply@gmail.com',
            subject: 'Code To Activate Your Matcha Account',
            template: 'action',
            html: `Save this 6 digit code "${activationCode}" and go back to Profile > Email activation to finish activate your account.`,
        })
        .catch((err) => {
            console.log(err);
        });;
    }
}