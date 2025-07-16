#!/usr/bin/env python3
"""
Script to download and install spaCy language model
Run this after installing requirements.txt
"""
import subprocess
import sys

def install_spacy_model():
    """Install spaCy English language model"""
    try:
        print("🔄 Installing spaCy English language model...")
        subprocess.check_call([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
        print("✅ spaCy model installed successfully!")
        print("💡 You can now start the backend server with: python3 main.py")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing spaCy model: {e}")
        print("🔧 Please run manually: python3 -m spacy download en_core_web_sm")
        return False
    except FileNotFoundError:
        print("❌ Python not found. Please ensure Python 3.8+ is installed.")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 AI Resume Parser - spaCy Model Installer")
    print("=" * 50)
    success = install_spacy_model()
    if success:
        print("\n🎉 Setup complete! Ready to run the backend server.")
    else:
        print("\n⚠️  Manual installation required. See error messages above.")