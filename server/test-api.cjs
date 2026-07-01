const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const secret = 'ca696500b2503872258854edbcf27c4001aa5042c9d46ef80c1bd8c906716ebc';

async function check() {
  const user = await prisma.user.findUnique({where:{email:'moderator1@nayibareilly.gov.in'}});
  if (!user) {
    console.error('User not found!');
    return;
  }
  
  const payload = {
    id: user.id,
    email: user.email,
    roles: ['moderator']
  };

  const token = jwt.sign(payload, secret, { expiresIn: '1h' });

  const res = await fetch('http://localhost:4001/api/v1/moderator/pending', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
  
  await prisma.$disconnect();
}

check();
