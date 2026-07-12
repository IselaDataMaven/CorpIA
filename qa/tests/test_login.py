from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install())
)

driver.maximize_window()

wait = WebDriverWait(driver, 15)

driver.get("http://localhost:5173")

# Esperar a que carguen los inputs
wait.until(
    EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='text']"))
)

usuario = driver.find_element(By.CSS_SELECTOR, "input[type='text']")
password = driver.find_element(By.CSS_SELECTOR, "input[type='password']")

usuario.send_keys("admin.corpia")
password.send_keys("Admin2026!")

# Buscar el botón Entrar
boton = driver.find_element(By.XPATH, "//button[contains(.,'Entrar')]")
boton.click()

print("Login enviado correctamente.")

input("Presiona ENTER para cerrar...")

driver.quit()