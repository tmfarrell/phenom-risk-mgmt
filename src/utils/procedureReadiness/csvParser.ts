interface ParsedMember {
  memberId: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: 'M' | 'F' | 'O';
}

export function parseCSV(content: string): ParsedMember[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file must contain a header row and at least one data row');
  }

  const header = lines[0].toLowerCase().split(',').map(h => h.trim());
  
  const memberIdCol = header.findIndex(h => 
    h.includes('member') && h.includes('id') || h === 'memberid' || h === 'id'
  );
  const firstNameCol = header.findIndex(h => 
    h.includes('first') || h === 'firstname' || h === 'fname'
  );
  const lastNameCol = header.findIndex(h => 
    h.includes('last') || h === 'lastname' || h === 'lname'
  );
  const ageCol = header.findIndex(h => h === 'age');
  const genderCol = header.findIndex(h => 
    h === 'gender' || h === 'sex' || h === 'g'
  );

  if (memberIdCol === -1 || firstNameCol === -1 || lastNameCol === -1 || ageCol === -1) {
    throw new Error(
      'CSV must contain columns: member_id (or id), first_name, last_name, age. Gender is optional.'
    );
  }

  const members: ParsedMember[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',').map(v => v.trim());
    
    const age = parseInt(values[ageCol], 10);
    if (isNaN(age) || age < 0 || age > 120) {
      console.warn(`Skipping row ${i + 1}: Invalid age`);
      continue;
    }

    let gender: 'M' | 'F' | 'O' = 'O';
    if (genderCol !== -1) {
      const genderValue = values[genderCol]?.toUpperCase();
      if (genderValue === 'M' || genderValue === 'MALE') gender = 'M';
      else if (genderValue === 'F' || genderValue === 'FEMALE') gender = 'F';
    }

    members.push({
      memberId: values[memberIdCol] || `MEM-${i.toString().padStart(5, '0')}`,
      firstName: values[firstNameCol] || 'Unknown',
      lastName: values[lastNameCol] || 'Unknown',
      age,
      gender,
    });
  }

  return members;
}

export function generateSampleCSV(): string {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'Robert', 'Emily', 'David', 'Lisa', 'James', 'Maria'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  
  const rows: string[] = ['member_id,first_name,last_name,age,gender'];
  
  const riskProfiles = [
    { count: 3, minAge: 82, maxAge: 85 },
    { count: 3, minAge: 78, maxAge: 81 },
    { count: 25, minAge: 72, maxAge: 77 },
    { count: 75, minAge: 68, maxAge: 71 },
    { count: 194, minAge: 62, maxAge: 67 },
    { count: 500, minAge: 56, maxAge: 61 },
    { count: 1000, minAge: 50, maxAge: 55 },
    { count: 1500, minAge: 44, maxAge: 49 },
    { count: 2500, minAge: 38, maxAge: 43 },
    { count: 4200, minAge: 25, maxAge: 37 },
  ];
  
  let memberIndex = 0;
  
  for (const profile of riskProfiles) {
    for (let i = 0; i < profile.count; i++) {
      const memberId = `MEM-${(10000 + memberIndex).toString()}`;
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const age = Math.floor(Math.random() * (profile.maxAge - profile.minAge + 1)) + profile.minAge;
      const gender = Math.random() > 0.5 ? 'M' : 'F';
      
      rows.push(`${memberId},${firstName},${lastName},${age},${gender}`);
      memberIndex++;
    }
  }
  
  return rows.join('\n');
}
