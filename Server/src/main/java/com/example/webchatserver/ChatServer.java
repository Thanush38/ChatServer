package com.example.webchatserver;


import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import jakarta.websocket.*;

import org.json.JSONObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.json.JSONArray;

@ServerEndpoint(value="/ws/{roomID}")
public class ChatServer {
    // Create hashmap for usernames
    private static Map<String, String> usernames = new HashMap<String, String>();
    // Create another hashmap for Username
    private static Map<String, List<String>> roomUsernames = new HashMap<String, List<String>>();

    // Hashmap for roomlist
    private static Map<String, String> roomList = new HashMap<String, String>();

    @OnOpen
    public void open(@PathParam("roomID") String RoomID, Session session) throws IOException{
        // Check if the roomID exists in the roomList
        if(!roomList.containsKey(RoomID)) {
            // If the roomID does not exist, add it to the roomList with the session ID
            roomList.put(session.getId(), RoomID);
        }
        // Send a message to the client asking for their username
        session.getBasicRemote().sendText(getEnterMessage());
    }

    @OnClose
    public void close(Session session) throws IOException {
        // Get the user's session ID
        String userId = session.getId();
        String roomId = roomList.get(userId);
        // Check if the user has a username
        if (usernames.containsKey(userId)) {
            // Retrieve the username
            String username = usernames.get(userId);
            usernames.remove(userId);
            roomUsernames.get(roomId).remove(username);
            // Broadcast this person left the server
            for (Session peer : session.getOpenSessions()) {
                if (roomList.get(peer.getId()).equals(roomId)) {
                    // Send a message to the peer indicating that the user has left the chat room
                    peer.getBasicRemote().sendText(getLeftMessage(username + " left the chat app"));
                }
            }
        }
    }

    @OnMessage
    public void handleMessage(String comm, Session session) throws IOException{
        String userID = session.getId();
        JSONObject jsonmsg = new JSONObject(comm);
        String type = (String) jsonmsg.get("type");
        String roomID = roomList.get(userID);

        // Not their first message
        String message = (String) jsonmsg.get("msg");

        if (usernames.containsKey(userID)) {
            String username = usernames.get(userID);
            System.out.println(username);
            for (Session peer : session.getOpenSessions()) {
                if (roomList.get(peer.getId()).equals(roomID)) {
                    peer.getBasicRemote().sendText(getMessage(message, username, roomID));
                }
            }
        } else { // First message is their username
            usernames.put(userID, message);
            if (roomUsernames.containsKey(roomID)){
                List<String> roomUsernamesList = roomUsernames.get(roomID);
                roomUsernamesList.add(message);
                roomUsernames.put(roomID, roomUsernamesList);
            } else {
                List<String> roomUsernamesList = new ArrayList<String>();
                roomUsernamesList.add(message);
                roomUsernames.put(roomID, roomUsernamesList);
            }
            session.getBasicRemote().sendText(welcomeUserMessage(message));
            // Broadcast this person joined the server to the rest
            for (Session peer : session.getOpenSessions()) {
                if (!peer.getId().equals(userID) && (roomList.get(peer.getId()).equals(roomID))) {
                    peer.getBasicRemote().sendText(newUserMessage(message));
                }
            }
        }
    }

    public String getMessage(String message, String username, String roomID) {
        JSONArray users = new JSONArray();
        for (String key : usernames.keySet()) {
            users.put(usernames.get(key));
        }

        JSONArray rooms = new JSONArray();
        for (String key : roomList.keySet()) {
            if (!rooms.toList().contains(roomList.get(key))) {
                rooms.put(roomList.get(key));
            }
        }

        JSONArray roomUsers = new JSONArray();
        List<String> roomUsernamesList = roomUsernames.get(roomID);
        roomUsers.put(roomUsernamesList);

        JSONObject response = new JSONObject();
        String currentRoom = roomList.get(username);
        response.put("type", "chat");
        response.put("message", "(" + username + "): " + message);
        response.put("users", users);
        response.put("roomUsers", roomUsernamesList);
        response.put("rooms", rooms);
        response.put("currentRoom", currentRoom);

        return response.toString();
    }

    public String getEnterMessage() {
        JSONArray users = new JSONArray();
        // Gather all usernames
        for (String key : usernames.keySet()) {
            users.put(usernames.get(key));
        }

        JSONArray rooms = new JSONArray();
        // Gather all unique room IDs
        for (String key : roomList.keySet()) {
            // Avoid duplicate entries
            if (!rooms.toList().contains(roomList.get(key))) {
                rooms.put(roomList.get(key));
            }
        }

        JSONArray roomUsers = new JSONArray();
        // Gather usernames in each room
        for (String key : roomUsernames.keySet()) {

            if (key.equals(roomList.get(key))) {
                roomUsers.put(roomUsernames.get(key));
            }
        }

        JSONObject response = new JSONObject();
        // Construct the response object
        response.put("type", "joined");
        response.put("message", "(Server): Please enter your username");
        response.put("users", users);
        response.put("roomUsers", roomUsers);
        response.put("rooms", rooms);

        return response.toString();
    }

    public String newUserMessage(String message) {
        JSONArray users = new JSONArray();
        // Gather all usernames
        for (String key : usernames.keySet()) {
            users.put(usernames.get(key));
        }

        JSONArray rooms = new JSONArray();
        // Gather all unique room IDs
        for (String key : roomList.keySet()) {
            // Avoid duplicate entries
            if (!rooms.toList().contains(roomList.get(key))) {
                rooms.put(roomList.get(key));
            }
        }

        JSONArray roomUsers = new JSONArray();
        // Gather usernames in each room
        for (String key : roomUsernames.keySet()) {

            if (key.equals(roomList.get(key))) {
                roomUsers.put(roomUsernames.get(key));
            }
        }

        JSONObject response = new JSONObject();
        // Construct the response object
        response.put("type", "joined");
        response.put("message", "(Server): " + message + " joined the chat room.");
        response.put("users", users);
        response.put("roomUsers", roomUsers);
        response.put("rooms", rooms);

        return response.toString();
    }

    public String welcomeUserMessage(String message) {
        // Initialize JSON
        JSONArray users = new JSONArray();
        JSONArray rooms = new JSONArray();
        JSONArray roomUsers = new JSONArray();
        // Gather all usernames
        for (String key : usernames.keySet()) {
            users.put(usernames.get(key));
        }

        for (String key : roomList.keySet()) {
            if (!rooms.toList().contains(roomList.get(key))) {
                rooms.put(roomList.get(key));
            }
        }

        for (String key : roomUsernames.keySet()) {
            if (key.equals(roomList.get(key))) {
                roomUsers.put(roomUsernames.get(key));
            }
        }

        JSONObject response = new JSONObject();
        response.put("type", "joined");
        response.put("message", "(Server): Welcome, " + message + "!");
        response.put("users", users);
        response.put("roomUsers", roomUsers);
        response.put("rooms", rooms);

        return response.toString();
    }

    public String getLeftMessage(String message) {
        // Gather all usernames
        JSONArray users = new JSONArray();
        for (String key : usernames.keySet()) {
            users.put(usernames.get(key));
        }
        // Gather all unique room IDs
        JSONArray rooms = new JSONArray();
        for (String key : roomList.keySet()) {
            // Avoid duplicate entries
            if (!rooms.toList().contains(roomList.get(key))) {
                rooms.put(roomList.get(key));
            }
        }
        // Gather usernames in each room
        JSONArray roomUsers = new JSONArray();
        for (String key : roomUsernames.keySet()) {
            if (key.equals(roomList.get(key))) {
                roomUsers.put(roomUsernames.get(key));
            }
        }
        // Construct the response object
        JSONObject response = new JSONObject();
        response.put("type", "left");
        response.put("message", "(Server): " + message + "!");
        response.put("users", users);
        response.put("roomUsers", roomUsers);
        response.put("rooms", rooms);

        return response.toString();
    }
}
