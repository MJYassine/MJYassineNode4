document.addEventListener('DOMContentLoaded', () => {
    const craftsContainer = document.getElementById('crafts');

    function fetchCrafts() {
        fetch('/api/crafts')
            .then(response => response.json())
            .then(crafts => {
                craftsContainer.innerHTML = '';
                crafts.forEach((craft, index) => {
                    const html = `
                        <div class="w3-quarter">
                            <img src="/uploads/${craft.image}" onclick="showModal(${index})" style="width:100%;cursor:pointer" alt="${craft.name}">
                        </div>
                    `;
                    craftsContainer.innerHTML += html;
                });
            })
            .catch(error => {
                console.error('Failed to fetch crafts:', error);
                alert('Failed to load crafts. Please try again later.');
            });
    }

    fetchCrafts(); 

    const modal = document.getElementById('craftModal');
    const addCraftModal = document.getElementById('addCraftModal');
    const editCraftModal = document.getElementById('editCraftModal');
    let currentCraftIndex = null;

    window.showModal = (index) => {
        currentCraftIndex = index;
        fetch(`/api/crafts/${index}`)
            .then(response => response.json())
            .then(craft => {
                document.getElementById('craftImage').src = `/uploads/${craft.image}`;
                document.getElementById('craftInfo').innerHTML = `
                    <h1>${craft.name}</h1>
                    <p>${craft.description}</p>
                    <ul>${craft.supplies.map(supply => `<li>${supply}</li>`).join('')}</ul>
                `;
                modal.style.display = "block";
            })
            .catch(error => {
                console.error('Error loading craft:', error);
                alert('Failed to load craft details.');
            });
    };

    modal.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    document.getElementById('addCraftBtn').addEventListener('click', function() {
        addCraftModal.style.display = 'block';
    });

    document.getElementById('addCraftForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        fetch('/api/crafts', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to create craft');
            }
            return response.json();
        })
        .then(newCraft => {
            console.log('Craft added:', newCraft);
            fetchCrafts(); 
            addCraftModal.style.display = 'none'; 
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to add craft. Please check your input and try again.');
        });
    });

    document.getElementById('editCraftForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const updatedCraft = {
            name: document.getElementById('editCraftName').value,
            description: document.getElementById('editCraftDescription').value,
            supplies: Array.from(document.querySelectorAll('#editSuppliesContainer input')).map(input => input.value)
        };

        fetch(`/api/updateCraft/${currentCraftIndex}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedCraft),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update craft');
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            fetchCrafts(); 
            editCraftModal.style.display = 'none'; 
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to update craft. Please check your input and try again.');
        });
    });
});
