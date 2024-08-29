let currentWebSocketCode = null; // Global variable to track the current WebSocket connection
let globalSocket = null;
getRooms();
console.log("added swear")

function setRoom(room){
    document.getElementById("room").value = room; // Set the room value in the input field
    console.log(document.getElementById("room").value); // Clear the chat log
    document.getElementById("log").innerHTML = "";
    enterRoom();
}

function enterRoom() {
    let code = document.getElementById("room").value;
    if(currentWebSocketCode !== code) {
        // Establish WebSocket connection for the selected room
        globalSocket = new WebSocket("ws://localhost:8080/WSChatServer-1.0-SNAPSHOT/ws/" + code);
        // Display the current room in the UI
        document.getElementById("currentRoom").textContent = "Current Room: " + code;

        // Event listener for incoming messages
        globalSocket.onmessage = function (event) {
            let message = JSON.parse(event.data);
            console.log(message)
            let messageHTML = document.createElement("p");
            // Check message type
            if (message.type === "joined") { // Display joined message in green
                messageHTML.textContent = "[" + timestamp() + "] " + message.message;
                messageHTML.style.color = "green";
                document.getElementById("log").innerHTML += messageHTML.outerHTML;
            } else if (message.type === "left") { // Display left message in red
                messageHTML.textContent = "[" + timestamp() + "] " + message.message;
                messageHTML.style.color = "red";
                document.getElementById("log").innerHTML += messageHTML.outerHTML;
            } else { // Display regular message in black
                messageHTML.textContent = "[" + timestamp() + "] " + message.message;
                messageHTML.style.color = "black";
                document.getElementById("log").innerHTML += messageHTML.outerHTML;
            }
            scrollToBottom("log");
            let rooms = message.rooms; // Update room list
            let roomHTML = "";
            for (let i = 0; i < rooms.length; i++) {
                roomHTML += "<li><a onclick=\"setRoom('" + rooms[i] + "')\" class='styled-link'>" + rooms[i] + "</a></li>"
            }
            console.log(document.getElementById("roomList").innerHTML);
            document.getElementById("roomList").innerHTML = roomHTML;


            let users = message.users; // Update user list
            let userHTML = "";
            for (let i = 0; i < users.length; i++) {
                userHTML += "<li>" + users[i] + "</li>"
            }
            document.getElementById("userList").innerHTML = userHTML;
        }

        // Event listener for sending messages on pressing Enter
        document.getElementById("input").addEventListener("keyup", function (event) {
            if (event.key === "Enter") {
                let message = event.target.value;
                if(message !== ""){

                let request = {"type": "chat", "msg": event.target.value};
                    globalSocket.send(JSON.stringify(request));

                event.target.value = "";
                }}

        });

        // Event listener for sending messages on clicking the send button
        document.getElementById("sendButton").addEventListener("click", () => {
            let message = document.getElementById("input").value
            if( message!== "") {
                let request = {"type": "chat", "msg": document.getElementById("input").value};

                globalSocket.send(JSON.stringify(request));
                document.getElementById("input").value = "";
            }
        });

        // Function to generate timestamp
        function timestamp() {
            let d = new Date(),
                minutes = d.getMinutes();
            if (minutes < 10) minutes = '0' + minutes;
            return d.getHours() + ':' + minutes;
        }
    }

}

async function getRoomCode(cont) { // Function to fetch room code
    let url = "http://localhost:8080/WSChatServer-1.0-SNAPSHOT/chat-servlet?createRoom=true";
    try {
        const response = await fetch(url );

        let data = await response.text();
        console.log(data)

        // Parse response data
        data = JSON.parse(data);
        let code = data.code;

        document.getElementById("room").value = code; // Set room code in the input field
        let AvailableRooms = data.availableRooms;
        console.log(AvailableRooms)
        let roomHTML = "";
        for (let i = 0; i < AvailableRooms.length; i++) { // Create HTML for room list
            roomHTML += "<li><a onclick=\"setRoom('" + AvailableRooms[i] + "')\" class='styled-link'>" + AvailableRooms[i] + "</a></li>"
        }

        // Populate room list
        document.getElementById("roomList").innerHTML = roomHTML;
        if(cont == true) { // Clear chat log and enter the room
            document.getElementById("log").innerHTML = "";
            enterRoom();
        }
    } catch (error) {
        console.error('Error fetching room code:', error);
    }
}

async function getRooms() { // Function to fetch available rooms
    let url = "http://localhost:8080/WSChatServer-1.0-SNAPSHOT/chat-servlet?createRoom=false";
    try {
        const response = await fetch(url);
        let data = await response.text();
        console.log(data)

        // Parse response data
        data = JSON.parse(data);
        let AvailableRooms = data.availableRooms;
        console.log(AvailableRooms)
        let roomHTML = "";
        for (let i = 0; i < AvailableRooms.length; i++) { // Create HTML for room list
            roomHTML += "<li><a onclick=\"setRoom('" + AvailableRooms[i] + "')\" class='styled-link'>" + AvailableRooms[i] + "</a></li>"
        }

        document.getElementById("roomList").innerHTML = roomHTML; // Populate room list
    } catch (error) {
        console.error('Error fetching room code:', error);
    }
}

const scrollToBottom = () => {
    var element = document.getElementById("scroll");
    element.scrollTop = element.scrollHeight;
}
