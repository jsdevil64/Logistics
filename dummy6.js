// 1. உங்களோட Google Apps Script URL-ஐ கீழே பேஸ்ட் பண்ணுங்க தலை
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxop5xAfkLYkH3Kr33L9k5a74LIogcYasChl18jwBodE1y2vbx5DJuulZDkLjAT7kae/exec';

// --- ROYAL GIFT SYSTEM CONFIG (உங்களின் UPI விபரங்கள்) ---
const MY_UPI_ID = '8939717405@ybl'; 
const MY_NAME = 'Royal Logistics Admin'; 

// DOM எலிமெண்ட்டுகள்
const transportGrid = document.getElementById('transport-grid');
const openFormBtn = document.getElementById('open-form-btn');
const registerModal = document.getElementById('register-modal');
const closeRegBtn = document.getElementById('close-reg-btn');
const transportForm = document.getElementById('transport-form');
const resultsCount = document.getElementById('results-count');

const tipsBtn = document.getElementById('tips-btn');
const tipsModal = document.getElementById('tips-modal');
const closeTipsBtn = document.getElementById('close-tips-btn');
const tipsForm = document.getElementById('tips-form');

const searchBtn = document.getElementById('search-btn');
const areaSearch = document.getElementById('area-search');
const vehicleFilter = document.getElementById('vehicle-filter');
const chips = document.querySelectorAll('.chip');

let vehiclesList = [];

// --- 2. Google Sheet-ல இருந்து வாகன விபரங்களை எடுக்கும் பங்க்ஷன் ---
async function loadVehiclesFromSheet() {
    transportGrid.innerHTML = `
        <div style="text-align:center; padding:40px; grid-column: 1/-1; color:#D4AF37;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size:28px; margin-bottom:10px;"></i>
            <p>வாகன விபரங்கள் லோடு ஆகிறது...</p>
        </div>`;
        
    try {
        const response = await fetch(SCRIPT_URL, { method: "GET", redirect: "follow" });
        vehiclesList = await response.json();
        
        if (vehiclesList.error) {
            console.error("Apps Script Error:", vehiclesList.error);
            transportGrid.innerHTML = '<div style="text-align:center; padding:40px; grid-column: 1/-1; color:red;"><p>Apps Script Error!</p></div>';
        } else {
            handleSearch(); 
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        transportGrid.innerHTML = '<div style="text-align:center; padding:40px; grid-column: 1/-1; color:red;"><p>டேட்டா லோடு செய்வதில் பிழை ஏற்பட்டுள்ளது!</p></div>';
    }
}

// --- 3. கார்டுகளை திரையில் காட்டும் பங்க்ஷன் ---
function renderVehicles(dataToRender = vehiclesList) {
    transportGrid.innerHTML = '';
    resultsCount.textContent = `${dataToRender.length} வாகனங்கள் உள்ளன`;

    if(dataToRender.length === 0) {
        transportGrid.innerHTML = `
            <div style="text-align:center; padding:40px; color:#5C677D; grid-column: 1/-1;">
                <i class="fa-solid fa-truck-slash" style="font-size:36px; margin-bottom:10px; color:#cbd5e1;"></i>
                <p>இந்த ஏரியாவில் வாகனங்கள் எதுவும் இல்லை! முதல் ஆளாகப் பதியவும்.</p>
            </div>`;
        return;
    }

    dataToRender.forEach(vehicle => {
        const card = document.createElement('div');
        card.className = 'expert-card';

        let iconHtml = '<i class="fa-solid fa-truck"></i>';
        let exampleText = 'Truck';
        if(vehicle.type === '2wheeler') { iconHtml = '<i class="fa-solid fa-motorcycle"></i>'; exampleText = 'XL / Bike'; }
        if(vehicle.type === '4wheeler') { iconHtml = '<i class="fa-solid fa-truck-pickup"></i>'; exampleText = 'Tata Ace'; }
        if(vehicle.type === '10wheeler') { iconHtml = '<i class="fa-solid fa-truck-flatbed"></i>'; exampleText = 'Lorry'; }

        card.innerHTML = `
            <div class="card-left">
                <div class="avatar-container">
                    ${iconHtml}
                </div>
                <div class="expert-info">
                    <h4>${vehicle.name} <span class="badge">${vehicle.type.toUpperCase()} (${exampleText})</span></h4>
                    <p class="price-tag">${vehicle.rate}</p>
                    <p class="expert-loc"><i class="fa-solid fa-location-dot"></i> ${vehicle.location}</p>
                </div>
            </div>
            <div class="card-right-actions">
                <a href="tel:${vehicle.phone}" class="call-btn-link"><i class="fa-solid fa-phone"></i></a>
                <a href="https://wa.me/91${vehicle.phone}" target="_blank" class="wa-btn-link"><i class="fa-brands fa-whatsapp"></i></a>
            </div>
        `;
        transportGrid.appendChild(card);
    });
}

// --- 4. தேடல் மற்றும் ஃபில்டர் லாஜிக் ---
function handleSearch() {
    const searchText = areaSearch.value.toLowerCase().trim();
    const selectedType = vehicleFilter.value;

    const filtered = vehiclesList.filter(v => {
        const matchesArea = v.location ? v.location.toLowerCase().includes(searchText) : false;
        const matchesType = (selectedType === 'all' || v.type === selectedType);
        return matchesArea && matchesType;
    });

    renderVehicles(filtered);
}

// ஈவென்ட்டுகள் (Events)
searchBtn.addEventListener('click', handleSearch);
areaSearch.addEventListener('input', handleSearch);
vehicleFilter.addEventListener('change', handleSearch);

chips.forEach(chip => {
    chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        vehicleFilter.value = chip.getAttribute('data-filter');
        handleSearch();
    });
});

// மோடல் செயல்பாடுகள் (Modal Actions)
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

// --- 5. ஃபார்ம் சப்மிட் மற்றும் Google Sheet சேமிப்பு லாஜிக் ---
transportForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = transportForm.querySelector('.submit-btn');
    submitBtn.textContent = 'பதிவாகிறது... வெயிட் பண்ணுங்க தலை...';
    submitBtn.disabled = true;

    const formData = new FormData();
    formData.append('name', document.getElementById('driver-name').value);
    formData.append('phone', document.getElementById('phone').value);
    formData.append('type', document.getElementById('vehicle-type').value);
    formData.append('rate', document.getElementById('rate').value);
    formData.append('location', document.getElementById('location').value);

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if(result.result === 'success') {
            alert('வாகன விபரங்கள் வெற்றிகரமாக Google Sheet-ல் சேமிக்கப்பட்டது!');
            transportForm.reset();
            registerModal.style.display = 'none';
            loadVehiclesFromSheet(); 
        } else {
            alert('பிழை: ' + result.error);
        }
    } catch (error) {
        console.error('Error saving:', error);
        alert('நெட்வொர்க் பிழை! கூகுள் ஷீட்டுடன் கனெக்ட் செய்ய முடியவில்லை.');
    } finally {
        submitBtn.textContent = 'விபரங்களைச் சமர்ப்பிக்க';
        submitBtn.disabled = false;
    }
});

// --- 6. UPI Payment (Tips) சப்மிட் லாஜிக் ---
if (tipsForm) {
    tipsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = document.getElementById('tips-amount').value;
        if (!amount || amount <= 0) return;

        // UPI டீப் லிங்கிங் URL (பயனர் மொபைலில் இருந்தால் GPay, PhonePe இயங்கும்)
        const upiUrl = `upi://pay?pa=${encodeURIComponent(MY_UPI_ID)}&pn=${encodeURIComponent(MY_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Royal Gift for Local Workers App')}`;
        window.location.href = upiUrl;
        
        tipsModal.style.display = 'none';
        tipsForm.reset();
    });
}

document.addEventListener('DOMContentLoaded', loadVehiclesFromSheet);
