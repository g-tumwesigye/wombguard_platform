#!/usr/bin/env python3
"""
Download AI models from GitHub Releases during Render deployment.
This script downloads the 3 model ZIP files and extracts them.
"""

import os
import sys
import urllib.request
import zipfile
from pathlib import Path

# GitHub Release URLs for model files
GITHUB_RELEASE_URL = "https://github.com/g-tumwesigye/wombguard_platform/releases/download/v1.0.0"

MODELS = [
    {
        "name": "model_general_finetuned",
        "url": f"{GITHUB_RELEASE_URL}/model_general_finetuned.zip",
        "size": "386 MB"
    },
    {
        "name": "model_medical_finetuned",
        "url": f"{GITHUB_RELEASE_URL}/model_medical_finetuned.zip",
        "size": "388 MB"
    },
    {
        "name": "model_qa_finetuned",
        "url": f"{GITHUB_RELEASE_URL}/model_qa_finetuned.zip",
        "size": "387 MB"
    }
]

def download_file(url, destination):
    """Download file with progress indicator."""
    print(f"📥 Downloading from: {url}")
    print(f"📁 Saving to: {destination}")
    
    def progress_hook(count, block_size, total_size):
        percent = int(count * block_size * 100 / total_size)
        sys.stdout.write(f"\r⏳ Progress: {percent}%")
        sys.stdout.flush()
    
    try:
        urllib.request.urlretrieve(url, destination, progress_hook)
        print("\n✅ Download complete!")
        return True
    except Exception as e:
        print(f"\n❌ Download failed: {e}")
        return False

def extract_zip(zip_path, extract_to):
    """Extract ZIP file."""
    print(f"📦 Extracting: {zip_path}")
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_to)
        print(f"✅ Extracted to: {extract_to}")
        return True
    except Exception as e:
        print(f"❌ Extraction failed: {e}")
        return False

def main():
    """Main function to download and extract all models."""
    print("=" * 60)
    print("🤖 WOMBGUARD AI MODELS SETUP")
    print("=" * 60)
    
    # Get the models directory path
    script_dir = Path(__file__).parent
    models_dir = script_dir.parent / "wombguardbot_models"
    
    print(f"\n📂 Models directory: {models_dir}")
    
    # Create models directory if it doesn't exist
    models_dir.mkdir(exist_ok=True)
    
    # Check if models already exist
    all_exist = True
    for model in MODELS:
        model_path = models_dir / model["name"]
        safetensors_path = model_path / "model.safetensors"
        if not safetensors_path.exists():
            all_exist = False
            break
    
    if all_exist:
        print("\n✅ All models already exist! Skipping download.")
        print("=" * 60)
        return 0
    
    # Download and extract each model
    for i, model in enumerate(MODELS, 1):
        print(f"\n{'=' * 60}")
        print(f"📦 MODEL {i}/3: {model['name']}")
        print(f"📊 Size: {model['size']}")
        print(f"{'=' * 60}")
        
        # Paths
        zip_filename = f"{model['name']}.zip"
        zip_path = models_dir / zip_filename
        extract_path = models_dir
        
        # Check if model already exists
        model_path = models_dir / model["name"]
        safetensors_path = model_path / "model.safetensors"
        
        if safetensors_path.exists():
            print(f"✅ Model already exists, skipping: {model['name']}")
            continue
        
        # Download
        if not download_file(model["url"], zip_path):
            print(f"❌ Failed to download {model['name']}")
            return 1
        
        # Extract
        if not extract_zip(zip_path, extract_path):
            print(f"❌ Failed to extract {model['name']}")
            return 1
        
        # Clean up ZIP file
        try:
            zip_path.unlink()
            print(f"🗑️  Removed ZIP file: {zip_filename}")
        except Exception as e:
            print(f"⚠️  Could not remove ZIP file: {e}")
        
        # Verify extraction
        if safetensors_path.exists():
            print(f"✅ Model verified: {model['name']}")
        else:
            print(f"❌ Model verification failed: {model['name']}")
            return 1
    
    print("\n" + "=" * 60)
    print("🎉 ALL MODELS DOWNLOADED AND EXTRACTED SUCCESSFULLY!")
    print("=" * 60)
    
    # List all model files
    print("\n📋 Installed Models:")
    for model in MODELS:
        model_path = models_dir / model["name"]
        if model_path.exists():
            files = list(model_path.glob("*"))
            print(f"\n✅ {model['name']}:")
            for file in files[:5]:  # Show first 5 files
                print(f"   - {file.name}")
            if len(files) > 5:
                print(f"   ... and {len(files) - 5} more files")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())

