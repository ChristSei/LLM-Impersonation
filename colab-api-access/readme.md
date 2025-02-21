# Running fine tuned model on Google Colab and enabling access to it via ngrok

note1: it is recommended to read the training section first, in order to understand how to start the notebook properly
note2: If you're using a model with parameter bigger than 3B and in free google colab environemnt, it's recommended to restart the google colab session before proceeding here, as there won't be ennough memory
note3: if you wish to have an immediate link to google colab and not upload the notebook, here it is: [colab link](https://colab.research.google.com/drive/1QMrneaAf4Yape1OoOSAC4rc9uqOnCKhn?usp=sharing)

## Ollama
### installation
Go to the cell which contains the following code
```py
%load_ext colabxterm
```

Execute. The purpose of the above code is to enable running terminal which gives u access to google colab's internal linux system.

Afterwards, run the first cell which contains
```py
%xterm
```
Wait a while, and a terminal window should open. Inside of it, you will want to copy and paste the following command

```sh
curl -fsSL https://ollama.com/install.sh | sh
```

### Add Model to Ollama
Now that we've finished installing ollama, run the following command ( while still in the same terminal where we installed ollama )

```sh
ollama serve
```

This will render the terminal unusable, so we will need to run the second cell which contains
```
%xterm
```
In this terminal, go to the model folder via the following command
```
cd model
```
and then type out the following command to add the model to ollama's database
```
ollama create mdl -f ./Modelfile
```
This will add the fine tuned model into ollama's database with the name of mdl.

## Ngrok
In order to access the ollama model from outside, we will need to use tunneling service like ngrok.
Make sure you have ngrok account

### installation
execute the third cell which contains the following command
```py
%xterm
```
Once the terminal opens up, execute the following command to install ngrok
```sh
curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc \
	| sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null \
	&& echo "deb https://ngrok-agent.s3.amazonaws.com buster main" \
	| sudo tee /etc/apt/sources.list.d/ngrok.list \
	&& sudo apt update \
	&& sudo apt install ngrok
```
The above command will download and install grok via apt.

Then, you will need to add you ngrok credentials, so copy the following command and run it in the terminal
```
ngrok config add-authtoken <token>
```
replace token with your own ngrok token

### Execute
In the same terminal where we've installed ngrok, execute the following command
```sh
ngrok http 11434 --host-header="localhost:11434"
```

We've now completed allowing external client to access our ollama API.

## API Request
make sure to perform the API request using the tunnel link provided by ngrok

### Generating Response
The API for generating response from LLM is located in the route
```
<ngrok-url>/api/generate
```
The API's method is POST
The API's body is JSON consisting of two fields
```js
{
  model: <string>
  prompt: <string>
}
```

model being the model name that's in the ollama's database. If you used the mdl name when adding the model to ollama, then use the same name (mdl) in the query.
prompt being the input you provide to the LLMs.

### API Response
The API response has the content-type of `application/x-ndjson`
and it will consists of the following JSON type
```js
{
  model: <string>
  created_at: <string>
  response: <string>
  done: <boolean>
  done_reason: <string>
  context: <Array<int>>
  total_duration: <int>
  load_duration: <int>;
  prompt_eval_count: <int>;
  prompt_eval_duration: <int>;
}
```

the most important fields are the following: done and response.
if the done has the value of false, that means the LLM is still generating new token, and vice versa, if the done has the value of true, that means the LLM is done generating response.

response will usually contains a single token (single character such as 'A', 'B', etc ). So, in order to provide the response in contiguous manner, further processing is needed.