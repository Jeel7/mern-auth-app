import jwt from 'jsonwebtoken'

export const generateTokenAndSetCookie = (res, userId) => {
    const token = jwt.sign(
        {
            userId 
        },
        process.env.JWT_SECRET_KEY,{
            expiresIn: "7d"
        }
    )

    res.cookie('token', token, {
        httpOnly: true,                                 //cookie can't be accessed by client side js
        secure: process.env.NODE_ENV === "production",  //only works on https
        sameSite: "strict",                             //prevent attck called 'csrf'
        maxAge: 7 * 24 * 60 * 60 * 1000                 //stored info. in cookie is valid for 7 days
    })
    return {token}
}
