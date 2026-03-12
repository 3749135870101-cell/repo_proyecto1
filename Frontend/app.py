import streamlit as st
import requests
import pandas as pd

st.set_page_config(page_title="Productos API", layout="wide")
st.title("Catálogo de Productos")

# URL del Backend (Ajustada para que todas las funciones la usen bien)
API_URL = "http://api-servidor:3000/api/products"

# Menú lateral
opcion = st.sidebar.radio(
    "Acción",
    ["Ver productos", "Crear producto", "Editar producto", "Eliminar producto"]
)


def obtener_datos_api(page=1, limit=10, search=""):
     try:
        params = {"page": page, "limit": limit, "search": search}
        # Ya no agregamos /products aquí porque ya está en API_URL
        response = requests.get(API_URL, params=params, timeout=2)
        
        if response.status_code == 200:
            res_json = response.json()
            # Tu API devuelve: {"ok":true, "data": {"data": [...], "meta": {...}}}
            if isinstance(res_json, dict) and "data" in res_json:
                return res_json["data"] 
     except Exception as e:
        print(f"Error de conexión: {e}")
    
     return {"data": [], "meta": {"total": 0, "page": 1, "totalPages": 1}}


# -------------------------------------------------------------------
# Opción 1: Ver productos (Corregido para Búsqueda)
# -------------------------------------------------------------------
if opcion == "Ver productos":
    st.header("Lista de productos")
    col1, col2, col3 = st.columns(3)
    with col1: page = st.number_input("Página", min_value=1, value=1)
    with col2: limit = st.number_input("Por página", min_value=1, max_value=50, value=10)
    with col3: q = st.text_input("Buscar por nombre") # Este q se pasa como search

    with st.spinner("Cargando..."):
        # PASAMOS 'q' AL PARÁMETRO 'search'
        resultado = obtener_datos_api(page, limit, search=q)
        productos = resultado["data"]
        meta = resultado["meta"]

    st.info(f"Total: {meta.get('total', 0)} productos | Página {meta.get('page', 1)} de {meta.get('totalPages', 1)}")

    if productos:
        df = pd.DataFrame(productos)
        st.dataframe(df[["id", "name", "price", "stock"]], use_container_width=True)
        
        st.subheader("Detalle del producto")
        prod_id = st.selectbox("Selecciona un ID", df["id"].tolist())
        if prod_id:
            p = df[df["id"] == prod_id].iloc[0].to_dict()
            st.write(f"**Descripción:** {p.get('description', 'N/A')}")
            st.write(f"**Última actualización:** {p.get('updated_at', 'N/A')}")
    else:
        st.warning("No se encontraron productos.")

# -------------------------------------------------------------------
# Opción 2: Crear producto
# -------------------------------------------------------------------
elif opcion == "Crear producto":
    st.header("Crear nuevo producto")
    with st.form("form_crear"):
        nombre = st.text_input("Nombre")
        desc = st.text_area("Descripción")
        precio = st.number_input("Precio", min_value=0.01, format="%.2f")
        stock = st.number_input("Stock", min_value=0)
        if st.form_submit_button("Guardar"):
            # URL unificada a API_URL
            res = requests.post(API_URL, json={"name": nombre, "description": desc, "price": precio, "stock": stock})
            if res.status_code in [200, 201]: st.success("¡Creado correctamente!")
            else: st.error(f"Error al crear: {res.text}")

# -------------------------------------------------------------------
# Opción 3: Editar producto (Corregido con ID en la URL)
# -------------------------------------------------------------------
elif opcion == "Editar producto":
    st.header("Editar producto")
    res_api = obtener_datos_api(limit=100)
    productos = res_api["data"]
    
    if not productos:
        st.warning("Sin productos.")
    else:
        opciones = {p["id"]: f"{p['id']} - {p['name']}" for p in productos}
        prod_id = st.selectbox("Selecciona producto", options=list(opciones.keys()), format_func=lambda x: opciones[x])
        
        producto = next(p for p in productos if p["id"] == prod_id)
        with st.form("form_edit"):
            n = st.text_input("Nombre", value=producto["name"])
            p = st.number_input("Precio", value=float(producto["price"]))
            s = st.number_input("Stock", value=int(producto["stock"]))
            if st.form_submit_button("Actualizar"):
                # IMPORTANTE: Se agrega /{prod_id} a la URL
                res = requests.put(f"{API_URL}/{prod_id}", json={"name": n, "price": p, "stock": s})
                if res.status_code in [200, 204]: st.success("¡Actualizado!")
                else: st.error("Error al actualizar")

# -------------------------------------------------------------------
# Opción 4: Eliminar producto (Corregido con ID en la URL)
# -------------------------------------------------------------------
elif opcion == "Eliminar producto":
    st.header("Eliminar producto")
    res_api = obtener_datos_api(limit=100)
    productos = res_api["data"]
    
    if productos:
        opciones = {p["id"]: f"{p['id']} - {p['name']}" for p in productos}
        id_del = st.selectbox("Eliminar ID", options=list(opciones.keys()), format_func=lambda x: opciones[x])
        if st.button("Confirmar Eliminación", type="primary"):
            # IMPORTANTE: Se agrega /{id_del} a la URL
            res = requests.delete(f"{API_URL}/{id_del}")
            if res.status_code in [200, 204]: st.success("Eliminado correctamente.")
            else: st.error("No se pudo eliminar.")