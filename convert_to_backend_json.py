import pandas as pd
import json
import os

# Paths
SOURCE_FOLDER = "data_enterprise"
TARGET_FOLDER = "backend/data"

os.makedirs(TARGET_FOLDER, exist_ok=True)

# Load CSV files
store_master = pd.read_csv(f"{SOURCE_FOLDER}/store_master.csv")
sku_master = pd.read_csv(f"{SOURCE_FOLDER}/sku_master.csv")
inventory_master = pd.read_csv(f"{SOURCE_FOLDER}/inventory_master.csv")
transactions = pd.read_csv(f"{SOURCE_FOLDER}/transactions_jun_dec_2025.csv")

# Convert to JSON format
store_master.to_json(f"{TARGET_FOLDER}/store_master.json", orient="records", indent=2)
sku_master.to_json(f"{TARGET_FOLDER}/sku_master.json", orient="records", indent=2)
inventory_master.to_json(f"{TARGET_FOLDER}/inventory_master.json", orient="records", indent=2)
transactions.to_json(f"{TARGET_FOLDER}/transactions.json", orient="records", indent=2)

print("CSV successfully converted to backend JSON format.")
