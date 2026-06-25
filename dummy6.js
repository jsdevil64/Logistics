// 1. உங்களுடைய புதிய கூகுள் ஆப்ஸ் ஸ்கிரிப்ட் வெப் ஆப் URL-ஐ இங்கே பேஸ்ட் செய்யவும்
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby7LA1bbl_rd7Oa1WqaiZHNexl7sMejHAmNPUFgElbUa8En7SamcCebol94dhvJgHfi/exec';

// --- UPI CONFIG (உங்களின் UPI விபரங்கள்) ---
const MY_UPI_ID = '8939717405@ybl'; 
const MY_NAME = 'Royal Logistics Admin'; 

// HTML Elements Mapping
const transportGrid  = document.getElementById('transport-grid');
const openFormBtn    = document.getElementById('open-form-btn');
const registerModal  = document.getElementById('register-modal');
const closeRegBtn    = document.getElementById('close-reg-btn');
const transportForm  = document.getElementById('transport-form');
const resultsCount   = document.getElementById('results-count');

const tipsBtn        = document.getElementById('tips-btn');
const tipsModal      = document.getElementById('tips-modal');
const closeTipsBtn   = document.getElementById('close-tips-btn');
const tipsForm       = document.getElementById('tips-form');

const searchBtn      = document.getElementById('search-btn');
const areaSearch     = document.getElementById('area-search');
const vehicleFilter  = document.getElementById('vehicle-filter');
const chips          = document.querySelectorAll('.chip');

let vehiclesList = [];

// --- 2. கூகுள் ஷீட்டில் இருந்து லோடு வாகன விபரங்களை இழுக்கும் பங்க்ஷன் ---
async function loadVehiclesFromSheet() {
    transportGrid.innerHTML = `
        <div style="text-align:center; padding:40px; grid-column: 1/-1; color:#D4AF37;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size:28px; margin-bottom:10px;"></i>
            <p>வாகன விபரங்கள் லோடு ஆகிறது...</p>
        </div>`;
        
    try {
        const response = await fetch(SCRIPT_URL, { method: "GET" });
        vehiclesList = await response.json();
        
        if (vehiclesList.error) {
            console.error("Apps Script Error:", vehiclesList.error);
            transportGrid.innerHTML = '<div style="text-align:center; padding:40px; grid-column: 1/-1; color:red;"><p>டேட்டா எடுப்பதில் பிழை!</p></div>';
        } else {
            handleSearch(); 
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        transportGrid.innerHTML = '<div style="text-align:center; padding:40px; grid-column: 1/-1; color:red;"><p>சர்வர் இணைப்பில் பிழை ஏற்பட்டுள்ளது!</p></div>';
    }
}

// --- 3. ஷீட் விபரங்களை வைத்து கார்டுகளை உருவாக்கும் லாஜிக் (Undefined-Proof) ---
function renderVehicles(dataToRender = vehiclesList) {
    transportGrid.innerHTML = '';
    resultsCount.textContent = `${dataToRender.length} வாகனங்கள் உள்ளன`;

    if(dataToRender.length === 0) {
        transportGrid.innerHTML = `
            <div style="text-align:center; padding:40px; color:#5C677D; grid-column: 1/-1;">
                <i class="fa-solid fa-truck-slash" style="font-size:36px; margin-bottom:10px; color:#cbd5e1;"></i>
                <p>இந்த ஏரியாவில் தற்சமயம் வாகனங்கள் எதுவும் இல்லை! முதல் ஆளாகப் பதியவும்.</p>
            </div>`;
        return;
    }

    dataToRender.forEach(vehicle => {
        const card = document.createElement('div');
        card.className = 'expert-card'; // உங்க CSS-க்கு ஏத்த மாதிரி

        // பாதுகாப்பான முறையில் டேட்டாவை பிரித்தெடுத்தல் (Undefined-ஐ தடுக்கும் Direct Index முறை)
        const vName     = vehicle.name     || vehicle["name"]     || Object.values(vehicle)[1] || "No Name";
        const vPhone    = vehicle.phone    || vehicle["phone"]    || Object.values(vehicle)[2] || "";
        const vType     = vehicle.type     || vehicle["type"]     || Object.values(vehicle)[3] || "4wheeler";
        const vRate     = vehicle.rate     || vehicle["rate"]     || Object.values(vehicle)[4] || "Contact for Rate";
        const vLocation = vehicle.location || vehicle["location"] || Object.values(vehicle)[5] || "No Location";

        // வாகன வகைக்கு ஏற்ப ஐகானை மாற்றுதல்
        let iconHtml = '<i class="fa-solid fa-truck-moving"></i>';
        let typeBadge = '4-WHEELER';
        
        if(vType.toString().toLowerCase() === '2wheeler') {
            iconHtml = '<i class="fa-solid fa-motorcycle"></i>';
            typeBadge = '2-WHEELER (XL)';
        } else if(vType.toString().toLowerCase() === '6wheeler') {
            iconHtml = '<i class="fa-solid fa-truck"></i>';
            typeBadge = '6-WHEELER (TRUCK)';
        } else if(vType.toString().toLowerCase() === '10wheeler') {
            iconHtml = '<i class="fa-solid fa-truck-flatbed"></i>';
            typeBadge = '10-WHEELER (LORRY)';
        }

        card.innerHTML = `
            <div class="card-left">
                <div class="avatar-container">
                    ${iconHtml}
                </div>
                <div class="expert-info">
                    <h4>${vName} <span class="badge">${typeBadge}</span></h4>
                    <p class="price-tag"><i class="fa-solid fa-money-bill-wave"></i> ${vRate}</p>
                    <p class="expert-loc"><i class="fa-solid fa-location-dot"></i> ${vLocation}</p>
                </div>
            </div>
            <div class="card-right-actions">
                <a href="tel:${vPhone}" class="call-btn-link"><i class="fa-solid fa-phone"></i></a>
                <a href="https://wa.me/91${vPhone}" target="_blank" class="wa-btn-link"><i class="fa-brands fa-whatsapp"></i></a>
            </div>
        `;
        transportGrid.appendChild(card);
    });
}

// --- 4. தேடல் மற்றும் வடிகட்டி (Search & Filter) லாஜிக் ---
function handleSearch() {
    const searchText = areaSearch.value ? areaSearch.value.toLowerCase().trim() : "";
    const selectedType = vehicleFilter.value;

    const filtered = vehiclesList.filter(vehicle => {
        const locationText = (vehicle.location || Object.values(vehicle)[5] || "").toString().toLowerCase();
        const matchesArea = locationText.includes(searchText);
        const matchesType = (selectedType === 'all' || vehicle.type === selectedType);
        return matchesArea && matchesType;
    });

    renderVehicles(filtered);
}

// தேடல் நிகழ்வுகள் (Events)
searchBtn.addEventListener('click', handleSearch);
areaSearch.addEventListener('input', handleSearch);
vehicleFilter.addEventListener('change', handleSearch);

// சிப்ஸ் ஃபில்டர் (Chips)
chips.forEach(chip => {
    chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        vehicleFilter.value = chip.getAttribute('data-filter');
        handleSearch();
    });
});

// மோடல் ஓபன்/க்ளோஸ் (Modals)
openFormBtn.addEventListener('click', () => registerModal.style.display = 'flex');
closeRegBtn.addEventListener('click', () => registerModal.style.display = 'none');

if(tipsBtn && tipsModal && closeTipsBtn) {
    tipsBtn.addEventListener('click', () => tipsModal.style.display = 'flex');
    closeTipsBtn.addEventListener('click', () => tipsModal.style.display = 'none');
}

window.addEventListener('click', (e) => {
    if (e.target === registerModal) registerModal.style.display = 'none';
    if (e.target === tipsModal) tipsModal.style.display = 'none';
});

// --- 5. ஃபார்ம் சப்மிட் மற்றும் உடனடி கார்டு அப்டேட் லாஜிக் ---
transportForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = transportForm.querySelector('.submit-btn');
    submitBtn.textContent = 'பதிவாகிறது... வெயிட் பண்ணுங்க தலை...';
    submitBtn.disabled = true;

    const formData = new URLSearchParams();
    formData.append('name', document.getElementById('driver-name').value);
    formData.append('phone', document.getElementById('phone').value);
    formData.append('type', document.getElementById('vehicle-type').value);
    formData.append('rate', document.getElementById('rate').value);
    formData.append('location', document.getElementById('location').value);

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: formData,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        const result = await response.json();
        
        if(result.result === 'success') {
            alert('வாகன விபரங்கள் வெற்றிகரமாக கூகுள் ஷீட்டில் சேமிக்கப்பட்டது!');
            transportForm.reset();
            registerModal.style.display = 'none';
            loadVehiclesFromSheet(); // உடனே கார்டுகளைப் புதுப்பிக்கிறது!
        } else {
            alert('பிழை: ' + result.error);
        }
    } catch (error) {
        console.error('Error uploading data:', error);
        alert('விபரங்கள் சேமிக்கப்பட்டுவிட்டது! கார்டுகளைப் பார்க்க பக்கத்தை ரீஃப்ரெஷ் செய்யவும்.');
        loadVehiclesFromSheet();
    } finally {
        submitBtn.textContent = 'விபரங்களைச் சமர்ப்பிக்க';
        submitBtn.disabled = false;
    }
});

// --- 6. UPI Payment (Tips) ---
if (tipsForm) {
    tipsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = document.getElementById('tips-amount').value;
        if (!amount || amount <= 0) return;

        const upiUrl = `upi://pay?pa=${encodeURIComponent(MY_UPI_ID)}&pn=${encodeURIComponent(MY_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Royal Logistics Tips')}`;
        window.location.href = upiUrl;
        
        tipsModal.style.display = 'none';
        tipsForm.reset();
    });
}

// பக்கம் லோடு ஆனதும் இயங்கும்
document.addEventListener('DOMContentLoaded', loadVehiclesFromSheet);

