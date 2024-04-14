let craftsData = []; 

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/crafts')
        .then(response => response.json())
        .then(crafts => {
            craftsData = crafts; 
            const craftsContainer = document.getElementById('crafts');
            crafts.forEach((craft, index) => {
                const html = `
                    <div class="w3-quarter">
                        <img src="/crafts/${craft.image}" onclick="showModal(${index})" style="width:100%;cursor:pointer" alt="${craft.name}">
                    </div>
                `;
                craftsContainer.innerHTML += html;
            });
        });

    const modal = document.getElementById("craftModal");
    const span = document.getElementsByClassName("close")[0];

    window.showModal = (index) => {
        const craft = craftsData[index]; 
        document.getElementById('craftImage').src = `/crafts/${craft.image}`;
        document.getElementById('craftInfo').innerHTML = `
            <h1>${craft.name}</h1>
            <p>${craft.description}</p>
            <ul>${craft.supplies.map(supply => `<li>${supply}</li>`).join('')}</ul>
        `;
        modal.style.display = "block";
        const editBtn = document.querySelector('.edit-btn');
        editBtn.onclick = function() {
            showEditModal(index);
            modal.style.display = "none"; 
        }
    }

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
    const editModal = document.getElementById('editCraftModal');
    const closeEditSpan = document.getElementsByClassName('closeEdit')[0];

    window.showEditModal = (index) => {
        currentCraftIndex = index;
        const craft = craftsData[index];
        document.getElementById('editCraftName').value = craft.name;
        document.getElementById('editCraftDescription').value = craft.description;
    
        const suppliesContainer = document.getElementById('editSuppliesContainer');
        suppliesContainer.innerHTML = '';
    
        craft.supplies.forEach(supply => {
            const supplyInput = document.createElement('input');
            supplyInput.setAttribute('type', 'text');
            supplyInput.setAttribute('name', 'editSupplies[]');
            supplyInput.value = supply;
    
            suppliesContainer.appendChild(supplyInput);
        });
    
        editModal.style.display = 'block';
    };

    closeEditSpan.onclick = function() {
        editModal.style.display = 'none';
    }
});

document.getElementById('addCraftBtn').addEventListener('click', function() {
    document.getElementById('addCraftModal').style.display = 'block';
    document.getElementById('addCraftForm').reset();
    document.getElementById('previewImage').style.display = 'none';
});

document.getElementById('selectImageBtn').addEventListener('click', function() {
    document.getElementById('craftImageInput').click();
});

document.getElementById('craftImageInput').addEventListener('change', function(event) {
    const [file] = event.target.files;
    if (file) {
        document.getElementById('previewImage').src = URL.createObjectURL(file);
        document.getElementById('previewImage').style.display = 'block';
    }
});

document.getElementById('addSupplyBtn').addEventListener('click', function() {
    const newSupplyInput = document.createElement('input');
    newSupplyInput.setAttribute('type', 'text');
    newSupplyInput.setAttribute('name', 'supplies[]');
    document.getElementById('suppliesContainer').appendChild(newSupplyInput);
});

document.getElementById('cancelBtn').addEventListener('click', function() {
    document.getElementById('addCraftModal').style.display = 'none';
});

document.getElementById('addCraftForm').addEventListener('submit', async function(event) {
    event.preventDefault();
});

window.onclick = function(event) {
    if (event.target == document.getElementById('addCraftModal')) {
        document.getElementById('addCraftModal').style.display = "none";
    }
}
document.getElementById('addEditSupplyBtn').addEventListener('click', function() {
    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.name = 'editSupplies[]';
    newInput.className = 'supply-input';

    const suppliesContainer = document.getElementById('editSuppliesContainer');
    suppliesContainer.appendChild(newInput);
});
document.getElementById('editCraftForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    const updatedCraft = {
        craftName: document.getElementById('editCraftName').value,
        craftDescription: document.getElementById('editCraftDescription').value,
        supplies: Array.from(document.querySelectorAll('#editSuppliesContainer input')).map(input => input.value)
    };

    fetch(`/api/updateCraft/${currentCraftIndex}`, {
        method: 'PUT', // Use PUT for update operations
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCraft),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => Promise.reject(err));
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        document.getElementById('editCraftModal').style.display = 'none'; 
        // Here, you might want to refresh the displayed list of crafts to include the updated information.
    })

});