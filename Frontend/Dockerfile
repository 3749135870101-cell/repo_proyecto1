# Imagen base de Python
FROM python:3.9-slim

# Directorio de trabajo
WORKDIR /app

# Copiar archivos del frontend
COPY . .

# Instalar dependencias (Flask es común para app.py)
RUN pip install flask requests

# Exponer el puerto del frontend (comúnmente 5000)
EXPOSE 5000

# Comando para ejecutar la aplicación
CMD ["python", "app.py"]