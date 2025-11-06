# WombGuard Models (Conversational ChatBot Models) Setup Guide

## **Model Files Required**

The WombGuard Platform uses **3 large models** for the chatbot functionality. These models are **not included in the git repository** due to their size (418 MB each, ~1.2 GB total).

---

## **Download Models from GitHub Releases**

### **Step 1: Download Model Files**

Go to the [GitHub Releases page](https://github.com/YOUR_USERNAME/wombguard-platform/releases) and download the following files from the latest release:

1. **model_general_finetuned.zip** (418 MB)
2. **model_medical_finetuned.zip** (418 MB)
3. **model_qa_finetuned.zip** (418 MB)

---

### **Step 2: Extract Models**

Extract the downloaded ZIP files into the correct directories:

```bash
# Navigate to project directory
cd wombguard_platform

# Extract models (macOS/Linux)
unzip model_general_finetuned.zip -d wombguardbot_models/
unzip model_medical_finetuned.zip -d wombguardbot_models/
unzip model_qa_finetuned.zip -d wombguardbot_models/

# For Windows (PowerShell)
Expand-Archive -Path model_general_finetuned.zip -DestinationPath wombguardbot_models/
Expand-Archive -Path model_medical_finetuned.zip -DestinationPath wombguardbot_models/
Expand-Archive -Path model_qa_finetuned.zip -DestinationPath wombguardbot_models/
```

---

### **Step 3: Verify Installation**

After extraction, your directory structure should look like this:

```
wombguard_platform/
└── wombguardbot_models/
    ├── model_general_finetuned/
    │   ├── model.safetensors (418 MB)
    │   ├── config.json
    │   ├── tokenizer_config.json
    │   └── ... (other files)
    ├── model_medical_finetuned/
    │   ├── model.safetensors (418 MB)
    │   ├── config.json
    │   └── ... (other files)
    ├── model_qa_finetuned/
    │   ├── model.safetensors (418 MB)
    │   ├── config.json
    │   └── ... (other files)
    ├── bm25_index.pkl
    ├── embeddings_ensemble.npy
    └── wombguardbot_dataset/
```

---

### **Step 4: Test Models**

Run the backend server to verify models are loaded correctly:

```bash
cd wombguard_predictive_api
python main.py
```

You should see in the logs:
```
INFO: Loaded model_general_finetuned
INFO: Loaded model_medical_finetuned
INFO: Loaded model_qa_finetuned
```

---

## **Alternative: Manual Download**

If you have the original model files, place them manually:

1. Create directories if they don't exist:
   ```bash
   mkdir -p wombguardbot_models/model_general_finetuned
   mkdir -p wombguardbot_models/model_medical_finetuned
   mkdir -p wombguardbot_models/model_qa_finetuned
   ```

2. Copy `model.safetensors` files to respective directories

---

## **Common Issues & **Troubleshooting**

### **Models Not Loading**
- Check file paths match the structure above
- Verify `model.safetensors` files are present
- Check file permissions (should be readable)

### **Out of Memory**
- Models require ~1.5 GB RAM to load
- Close other applications if needed
- Consider using a machine with more RAM

### **Download Failed**
- Large files may timeout on slow connections
- Try downloading again
- Use a download manager for reliability

---

## **Model Information**

| Model | Size | Purpose |
|-------|------|---------|
| **model_general_finetuned** | 418 MB | General pregnancy questions |
| **model_medical_finetuned** | 418 MB | Medical/clinical questions |
| **model_qa_finetuned** | 418 MB | Q&A format questions |

**Total Size:** ~1.2 GB

---

## **Why did I upload Models to Github Releases**

- GitHub has a 100 MB file size limit for regular commits


---

## **For Developers**

If you're training new models or updating existing ones:

1. Train your models
2. Create ZIP files:
   ```bash
   cd wombguardbot_models
   zip -r model_general_finetuned.zip model_general_finetuned/
   zip -r model_medical_finetuned.zip model_medical_finetuned/
   zip -r model_qa_finetuned.zip model_qa_finetuned/
   ```
3. Upload to GitHub Releases
4. Update release notes with model version info

---

## **Next Steps**

After models are installed:
1. Follow the main [README.md](README.md) for full setup
2. Install Python dependencies
3. Configure environment variables
4. Run the application


