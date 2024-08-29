
let currentWebSocketCode = null; // Global variable to track the current WebSocket connection
let globalSocket = null;
getRooms();
console.log("added swaer")

function setRoom(room){
    document.getElementById("room").value = room;
    console.log(document.getElementById("room").value);
    document.getElementById("log").innerHTML = "";
    enterRoom();
}


function enterRoom() {
    let code = document.getElementById("room").value;
    if(currentWebSocketCode !== code) {

        // let ws = new WebSocket("ws://localhost:8080/WSChatServer-1.0-SNAPSHOT/ws/" + code);
        globalSocket = new WebSocket("ws://localhost:8080/WSChatServer-1.0-SNAPSHOT/ws/" + code);

        document.getElementById("currentRoom").textContent = "Current Room: " + code;

        globalSocket.onmessage = function (event) {
            let message = JSON.parse(event.data);
            console.log(message)
            let messageHTML = document.createElement("p");
            if (message.type === "joined") {
                messageHTML.textContent = "[" + timestamp() + "] " + message.message;
                messageHTML.style.color = "green";
                document.getElementById("log").innerHTML += messageHTML.outerHTML;
            } else if (message.type === "left") {
                messageHTML.textContent = "[" + timestamp() + "] " + message.message;
                messageHTML.style.color = "red";
                document.getElementById("log").innerHTML += messageHTML.outerHTML;
            } else {
                messageHTML.textContent = "[" + timestamp() + "] " + message.message;
                messageHTML.style.color = "black";
                document.getElementById("log").innerHTML += messageHTML.outerHTML;
            }
            scrollToBottom("log");
            let rooms = message.rooms;
            let roomHTML = "";
            for (let i = 0; i < rooms.length; i++) {
                roomHTML += "<li><a onclick=\"setRoom('" + rooms[i] + "')\" class='styled-link'>" + rooms[i] + "</a></li>"
            }
            console.log(document.getElementById("roomList").innerHTML);
            document.getElementById("roomList").innerHTML = roomHTML;


            let users = message.users;
            let userHTML = "";
            for (let i = 0; i < users.length; i++) {
                userHTML += "<li>" + users[i] + "</li>"
            }
            document.getElementById("userList").innerHTML = userHTML;
        }


        document.getElementById("input").addEventListener("keyup", function (event) {
            if (event.key === "Enter") {
                let message = event.target.value;
                if(message !== ""){



                let request = {"type": "chat", "msg": event.target.value};
                    globalSocket.send(JSON.stringify(request));

                event.target.value = "";
                }}

        });

        document.getElementById("sendButton").addEventListener("click", () => {
            let message = document.getElementById("input").value
            if( message!== "") {
                let request = {"type": "chat", "msg": document.getElementById("input").value};


                globalSocket.send(JSON.stringify(request));
                document.getElementById("input").value = "";
            }
        })


        function timestamp() {
            let d = new Date(),
                minutes = d.getMinutes();
            if (minutes < 10) minutes = '0' + minutes;
            return d.getHours() + ':' + minutes;
        }
    }

}


async function getRoomCode(cont) {
    let url = "http://localhost:8080/WSChatServer-1.0-SNAPSHOT/chat-servlet?createRoom=true";
    try {
        const response = await fetch(url );

        let data = await response.text();
        console.log(data)

        data = JSON.parse(data);
        let code = data.code;
        document.getElementById("room").value = code;
        let AvailableRooms = data.availableRooms;
        console.log(AvailableRooms)
        let roomHTML = "";
        for (let i = 0; i < AvailableRooms.length; i++) {
            roomHTML += "<li><a onclick=\"setRoom('" + AvailableRooms[i] + "')\" class='styled-link'>" + AvailableRooms[i] + "</a></li>"
        }

        document.getElementById("roomList").innerHTML = roomHTML;
        if(cont==true){
            document.getElementById("log").innerHTML = "";
            enterRoom();
        }
    } catch (error) {
        console.error('Error fetching room code:', error);
    }
}

async function getRooms() {
    let url = "http://localhost:8080/WSChatServer-1.0-SNAPSHOT/chat-servlet?createRoom=false";
    try {
        const response = await fetch(url);
        let data = await response.text();
        console.log(data)

        data = JSON.parse(data);
        let AvailableRooms = data.availableRooms;
        console.log(AvailableRooms)
        let roomHTML = "";
        for (let i = 0; i < AvailableRooms.length; i++) {
            roomHTML += "<li><a onclick=\"setRoom('" + AvailableRooms[i] + "')\" class='styled-link'>" + AvailableRooms[i] + "</a></li>"
        }

        document.getElementById("roomList").innerHTML = roomHTML;
    } catch (error) {
        console.error('Error fetching room code:', error);
    }
}



const scrollToBottom = () => {
    var element = document.getElementById("scroll");
    element.scrollTop = element.scrollHeight;
}


