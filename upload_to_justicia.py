#!/usr/bin/env python3
"""
Script pour uploader tous les documents extraits dans Justicia via l'interface web
"""

import os
import time
from pathlib import Path

# Utiliser selenium pour automatiser le navigateur
try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.options import Options
except ImportError:
    print("Installation de selenium...")
    os.system("pip3 install selenium -q")
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.options import Options

def upload_documents():
    # Configuration Chrome headless
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        print("🚀 Ouverture de Justicia...")
        driver.get("https://5173-i1qym2pbbc9e6c4xxwq2z-774479a2.manusvm.computer")
        
        time.sleep(3)
        
        # Liste des fichiers
        extracted_dir = Path("/home/ubuntu/extracted_texts")
        files = sorted([f for f in extracted_dir.glob("*.txt") if f.name != "_extraction_summary.txt"])
        
        print(f"\n📚 {len(files)} documents à uploader\n")
        
        for i, file_path in enumerate(files, 1):
            print(f"[{i}/{len(files)}] Upload: {file_path.name}")
            
            # Trouver le bouton d'upload
            try:
                upload_button = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='file']"))
                )
                
                # Upload le fichier
                upload_button.send_keys(str(file_path))
                
                # Attendre que l'upload soit terminé
                time.sleep(5)
                
                print(f"   ✅ Uploadé")
                
            except Exception as e:
                print(f"   ❌ Erreur: {e}")
                continue
        
        print("\n✅ Tous les documents ont été uploadés!")
        
    finally:
        driver.quit()

if __name__ == "__main__":
    upload_documents()
