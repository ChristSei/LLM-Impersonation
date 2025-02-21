package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
)

type RequestBody struct {
	Model  string `json:"model"`
	Prompt string `json:"prompt"`
}

type ResponseChunk struct {
	Response string `json:"response"`
	Done     bool   `json:"done"`
}

func callBot(message string) string {
	baseUrl := os.Getenv("BASE_URL")
	url := baseUrl + "/api/generate"

	RequestBody := RequestBody{
		Model:  "mdl",
		Prompt: message,
	}

	jsonData, err := json.Marshal(RequestBody)
	if err != nil {
		fmt.Println("ERROR ENCODING JSON", err)
		return "<ERROR> " + err.Error()
	}

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Println("ERROR POSTING REQUEST", err)
		return "<ERROR> " + err.Error()
	}

	defer resp.Body.Close()

	contentType := resp.Header.Get("Content-Type")
	var fullMessage strings.Builder
	if strings.Contains(contentType, "application/x-ndjson") {

		scanner := bufio.NewScanner(resp.Body)
		for scanner.Scan() {
			line := scanner.Text()
			if line == "" {
				return "<ERROR> " + err.Error()
			}

			var chunk ResponseChunk
			if err := json.Unmarshal([]byte(line), &chunk); err != nil {
				fmt.Println("ERROR DECODING JSON CHUNK", err)
				continue
			}

			if chunk.Done {
				break
			}

			fullMessage.WriteString(chunk.Response)
		}

		if err := scanner.Err(); err != nil {
			fmt.Println("ERROR READING RESPONSE", err)
			return "<ERROR> " + err.Error()
		}
	}

	return fullMessage.String()
}
