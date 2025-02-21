# Fine Tuning LLM to impersonate using Jupyter Notebook

# Configuration
## Method
The fine tuning is performed using the unsloth library as well as using LORA adapters to reduce the memory consumption.

## Models
### Supported Models
Only models supported by unsloth could be used in the training

### Changing Models
If you want to change the model used in the training, go to the cell that contains this code
```python
from unsloth import FastLanguageModel
import torch
max_seq_length = 2048 # Choose any! We auto support RoPE Scaling internally!
dtype = None # None for auto detection. Float16 for Tesla T4, V100, Bfloat16 for Ampere+
load_in_4bit = True # Use 4bit quantization to reduce memory usage. Can be False.

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/Llama-3.1-8B-Instruct", # or choose "unsloth/Llama-3.2-1B-Instruct"
    max_seq_length = max_seq_length,
    dtype = dtype,
    load_in_4bit = load_in_4bit,
    # token = "hf_...", # use one if using gated models like meta-llama/Llama-2-7b-hf
)
```
Modify the model_name parameter to whichever model you'd like to use. 
If you downloaded the model to run locally, use the folder's name

## Dataset

### Dataset Database
for the Jupyter Notebook's access to various datasets, it needs a single file that serves as an address book. That file is called 
```
Dataset DB.cvs
```
Inside of the cvs file, there should be at least a column with header
```
Dataset Name
```
and it's row should consists of the dataset's name excluding it's file extension. (e.g: `Person A BBC interview`, then the dataset's filename is `Person A BBC interview.txt` )

### Datasets
The dataset has to be in .txt file format. While the content of the file must be in the following format
```
Question: Lorem Ipsum
Answer: Lorem Ipsum
Question: Lorem Ipsum
Answer: Lorem Ipsum

Question: Lorem Ipsum
Answer: Lorem Ipsum
```
For every question, there must be an answer. There may be spaces inbetween each pair of question and answer

### Folder Structure
for the dataset's folder structure, the `Dataset DB.csv` file has to be in a folder called `Dataset`. The `Dataset` folder is in the same level of directory as the Jupyter Notebook file.

The Datasets, are to be inserted into `Dataset/txts` directory.
Below is a tree viewing of the folder structure
<pre>
Dataset/
│   ├── Dataset DB.cvs
│   ├── txts/
│   │   ├── Person A BBC interview.txt
│   │   └── Person A podcast.txt
training-notebook.ipynb
</pre>

# Fine tuning
## Start
Start all of the notebook cells in the Jupyter Notebook

## Result
Once everything is done, there will be a folder called `model` and inside will be the fine tuned model result in .gguf

## Error Handling
### llama.cpp couldn't compile
For this, you will have to run cmake on llama.cpp folder, and then compile it yourself.

### CPU Offload error
if there's a text somewhere that says CPU error, that means the model is too heavy for your system, you will have to choose a smaller model

### Some values were infinite
This is the same scenario as the above, try to choose a smaller model