//Take this code from mailtrap website, API -> Node.js sdk

import dotenv from 'dotenv'
dotenv.config()
import {MailtrapClient} from 'mailtrap'

export const mailtrapClient = new MailtrapClient({
    endpoint: process.env.MAILTRAP_ENDPOINT,
    token: process.env.MAILTRAP_TOKEN
});

export const sender = {
    email: "hello@demomailtrap.com",      //from here, user will get all mails
    name: "Jeel",
};
