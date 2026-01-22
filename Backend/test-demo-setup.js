// Test script to verify demo setup works without MongoDB
const { isDemoUser, getDemoUser, demoUsers } = require('./data/demoData');

console.log('🧪 Testing Demo Setup...\n');

// Test 1: Check demo users exist
console.log('✅ Demo Users Available:');
demoUsers.forEach(user => {
  console.log(`   - ${user.role}: ${user.email} (${user.name})`);
});

// Test 2: Test demo user detection
console.log('\n✅ Demo User Detection:');
const testEmails = [
  'student@demo.com',
  'faculty@demo.com', 
  'admin@demo.com',
  'super@demo.com',
  'real-user@example.com'
];

testEmails.forEach(email => {
  const isDemo = isDemoUser(email);
  console.log(`   - ${email}: ${isDemo ? '✅ DEMO' : '❌ NOT DEMO'}`);
});

// Test 3: Test demo user retrieval
console.log('\n✅ Demo User Retrieval:');
const demoStudent = getDemoUser('student@demo.com');
if (demoStudent) {
  console.log(`   - Student: ${demoStudent.name} (${demoStudent.role})`);
  console.log(`   - College: ${demoStudent.college}`);
  console.log(`   - Department: ${demoStudent.department}`);
} else {
  console.log('   - ❌ Failed to retrieve demo student');
}

// Test 4: Test password matching (simple for demo)
console.log('\n✅ Demo Authentication Test:');
const testLogin = (email, password) => {
  const user = getDemoUser(email);
  if (user && user.password === password) {
    return { success: true, user: user.name };
  }
  return { success: false };
};

const loginTests = [
  { email: 'student@demo.com', password: 'demo123' },
  { email: 'faculty@demo.com', password: 'demo123' },
  { email: 'admin@demo.com', password: 'demo123' },
  { email: 'super@demo.com', password: 'demo123' },
  { email: 'student@demo.com', password: 'wrong' },
];

loginTests.forEach(test => {
  const result = testLogin(test.email, test.password);
  const status = result.success ? '✅ SUCCESS' : '❌ FAILED';
  console.log(`   - ${test.email} / ${test.password}: ${status}`);
});

console.log('\n🎉 Demo setup test completed!');
console.log('\n📋 Next Steps:');
console.log('1. Set DEMO_MODE=true in Backend/.env');
console.log('2. Run: cd Backend && npm run dev');
console.log('3. Run: cd Frontend && npm run dev');
console.log('4. Open http://localhost:5173 and test demo login buttons');