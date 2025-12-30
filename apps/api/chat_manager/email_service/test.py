



def  a():
    email = '<abldjf'
    if '<' in email:
        email1 = email.split('<')[1]
        print(email1)

        if '>' in email1:
            email2 = email1.split('>')[0]
            print(email2)

a()