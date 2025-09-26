import streamlit as st
import pandas as pd
import smtplib
from email.message import EmailMessage

# ----------------- Page Config -----------------
st.set_page_config(page_title="Digital Complaint Wall", layout="wide")

# ----------------- Session Databases -----------------
if "complaints" not in st.session_state:
    st.session_state.complaints = []

if "students_db" not in st.session_state:
    st.session_state.students_db = {"123": "123"}  # default login

if "notifications" not in st.session_state:
    st.session_state.notifications = {}

admin_password = "admin123"

# ----------------- Session States -----------------
if "student_logged_in" not in st.session_state:
    st.session_state.student_logged_in = False
if "student_email" not in st.session_state:
    st.session_state.student_email = None
if "admin_logged_in" not in st.session_state:
    st.session_state.admin_logged_in = False

# ----------------- Email Function -----------------
def send_email(to_email, subject, body):
    EMAIL_ADDRESS = "yourgmail@gmail.com"  # Replace with your Gmail
    EMAIL_PASSWORD = "yourapppassword"    # Replace with your app password

    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = EMAIL_ADDRESS
    msg['To'] = to_email
    msg.set_content(body)

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            smtp.send_message(msg)
        return True
    except Exception as e:
        st.error(f"Email failed: {e}")
        return False

# ----------------- Sidebar Role -----------------
role = st.sidebar.radio("Select Role", ["Student", "Admin"])
st.title("📝 Digital Complaint Wall")

# ----------------- STUDENT SECTION -----------------
if role == "Student":
    auth_option = st.radio("Student Option", ["Sign In", "Sign Up"], index=0, horizontal=True)

    # Sign Up
    if auth_option == "Sign Up":
        email = st.text_input("Email *")
        password = st.text_input("Password *", type="password")
        if st.button("Sign Up"):
            if email and password:
                st.session_state.students_db[email] = password
                st.success("Account created! You can now sign in.")
            else:
                st.error("Fill all fields!")

    # Sign In
    elif auth_option == "Sign In":
        username = st.text_input("Username/Email *")
        password = st.text_input("Password *", type="password")
        if st.button("Sign In"):
            if username in st.session_state.students_db and st.session_state.students_db[username] == password:
                st.session_state.student_logged_in = True
                st.session_state.student_email = username
                st.success(f"Logged in as {username}")
            else:
                st.error("Invalid credentials!")

    # Complaint Form
    if st.session_state.student_logged_in:
        st.subheader("Submit Complaint")
        with st.form("complaint_form", clear_on_submit=True):
            name = st.text_input("Your Name *")
            student_id = st.text_input("Student ID / Email *")
            category = st.selectbox("Category *", ["Hostel","Canteen","Library","WiFi","Transport",
                                                  "Classroom","Lab","Mess","Sports","Maintenance","Other"])
            priority = st.selectbox("Priority *", ["High","Medium","Low"])
            complaint = st.text_area("Complaint Details *")
            uploaded_file = st.file_uploader("Upload Proof (Optional)")

            submitted = st.form_submit_button("Submit Complaint")

            if submitted:
                if not name or not student_id or not category or not priority or not complaint:
                    st.error("Please fill all mandatory fields! ❌")
                else:
                    st.session_state.complaints.append({
                        "Name": name,
                        "StudentID": student_id,
                        "Category": category,
                        "Priority": priority,
                        "Complaint": complaint,
                        "File": uploaded_file.name if uploaded_file else None,
                        "FileData": uploaded_file.getvalue() if uploaded_file else None,
                        "Status": "Pending"
                    })
                    st.success("✅ Complaint submitted successfully!")
                    st.balloons()

        # Display notifications
        st.sidebar.header("Notifications")
        if st.session_state.student_email in st.session_state.notifications:
            for note in st.session_state.notifications[st.session_state.student_email]:
                st.sidebar.success(note)

# ----------------- ADMIN SECTION -----------------
if role == "Admin":
    if not st.session_state.admin_logged_in:
        password = st.text_input("Admin Password *", type="password")
        if st.button("Login as Admin"):
            if password == admin_password:
                st.session_state.admin_logged_in = True
                st.success("Admin logged in")
            else:
                st.error("Incorrect password!")
    else:
        st.subheader("Admin Dashboard")

        df = pd.DataFrame(st.session_state.complaints)
        if not df.empty:
            # Filters
            category_filter = st.multiselect("Filter by Category", options=df['Category'].unique(), default=df['Category'].unique())
            priority_filter = st.multiselect("Filter by Priority", options=df['Priority'].unique(), default=df['Priority'].unique())
            status_filter = st.multiselect("Filter by Status", options=df['Status'].unique(), default=df['Status'].unique())
            
            filtered_df = df[(df['Category'].isin(category_filter)) &
                             (df['Priority'].isin(priority_filter)) &
                             (df['Status'].isin(status_filter))]

            # Display complaints and manage proof & status
            for idx, row in filtered_df.iterrows():
                st.markdown(f"### Complaint by {row['Name']} ({row['StudentID']})")
                st.write(f"**Category:** {row['Category']} | **Priority:** {row['Priority']} | **Status:** {row['Status']}")
                st.write(f"**Details:** {row['Complaint']}")

                # Download proof if exists
                if row['FileData']:
                    st.download_button(
                        label=f"Download Proof: {row['File']}",
                        data=row['FileData'],
                        file_name=row['File'],
                        key=f"download_{idx}"
                    )

                # Update status
                new_status = st.selectbox(f"Update Status", ["Pending","Resolved"], 
                                          index=0 if row['Status']=="Pending" else 1, key=f"status_{idx}")
                if new_status != row['Status']:
                    st.session_state.complaints[idx]['Status'] = new_status
                    if new_status == "Resolved":
                        student_email = row['StudentID']
                        st.session_state.notifications.setdefault(student_email, []).append(
                            f"Your complaint '{row['Category']}' has been resolved ✅")
                        send_email(student_email, "Complaint Resolved", f"Your complaint '{row['Category']}' has been resolved. Thank you!")

            # Graphs
            st.subheader("📊 Complaint Statistics")
            col1, col2, col3 = st.columns(3)
            with col1:
                st.bar_chart(filtered_df["Category"].value_counts())
            with col2:
                st.bar_chart(filtered_df["Priority"].value_counts())
            with col3:
                st.bar_chart(filtered_df["Status"].value_counts())










