List-n-Ride Frontend
===============

Staging: [`http://staging.listnride.com/`](http://staging.listnride.com/)
Production: [`http://listnride.com/`](http://listnride.com/)

Prerequisites
-------------
Required software: `npm`

Install
-----------------
```
git clone https://github.com/listnride/listnride-frontend.git && cd listnride-frontend/listnride
npm install
```

Create local config
-------------------
```
cp .env.example .env
```

Launch
------------
```
# start with default settings
npm start

# or start on another port
npm start -- --env.PORT=8080

# or start and open browser
npm start -- --open
```
Navigate to [http://localhost:8080](http://localhost:8080)


Branching guide
------------- 
All new branches must use `dev` as a base branch
Name your branches as: 'FL-name-of-some-feature', where FL - your initials

Before create new PR: 
Ensure that your branch has latest changes from `dev`. You can update it using, for example `git rebase`
