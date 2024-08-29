package com.example.webchatserver;

import java.io.*;
import java.util.HashSet;
import java.util.Set;

import jakarta.servlet.http.*;
import jakarta.servlet.annotation.*;
import org.apache.commons.lang3.RandomStringUtils;
import org.json.JSONArray;
import org.json.JSONObject;
/**
 * This is a class that has services
 * In our case, we are using this to generate unique room IDs **/
@WebServlet(name = "chatServlet", value = "/chat-servlet")
public class ChatServlet extends HttpServlet {
    private String message;

    //static so this set is unique
    public static Set<String> rooms = new HashSet<>();

    /**
     * Method generates unique room codes
     * **/
    public String generatingRandomUpperAlphanumericString(int length) {
        String generatedString = RandomStringUtils.randomAlphanumeric(length).toUpperCase();
        // generating unique room code
        while (rooms.contains(generatedString)){
            generatedString = RandomStringUtils.randomAlphanumeric(length).toUpperCase();
        }
        rooms.add(generatedString);

        return generatedString;
    }

    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("text/plain");

        // send the random code as the response's content
        Boolean createRoom = Boolean.parseBoolean(request.getParameter("createRoom"));

        PrintWriter out = response.getWriter();
        JSONObject obj = new JSONObject();
        if(createRoom){
            obj.put("code", generatingRandomUpperAlphanumericString(5));
        }
        JSONArray availableRooms = new JSONArray(rooms);
        obj.put("availableRooms", availableRooms);

        out.println(obj.toString());

    }

    public void destroy() {
    }
}
