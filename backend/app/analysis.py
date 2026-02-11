import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression

def analyze_water_data(df: pd.DataFrame):

    # Clean columns
    df = df[["Date ", "Value"]]
    df.columns = ["Date", "Total"]

    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    df["Total"] = pd.to_numeric(df["Total"], errors="coerce")
    df = df.dropna()

    # Filter period
    start_date = pd.to_datetime("2021-12-17")
    end_date = pd.to_datetime("2023-12-16")

    filtered_df = df[
        (df["Date"] >= start_date) &
        (df["Date"] <= end_date)
    ].copy()

    if filtered_df.empty:
        return {"error": "No data found in selected date range"}

    # ========================
    # KLD Analysis
    # ========================

    mean_kld = filtered_df["Total"].mean()
    daily_exceed_df = filtered_df[filtered_df["Total"] > 3700]
    daily_exceed_count = len(daily_exceed_df)

    # Daily violation details
    daily_violation_details = [
        {
            "date": row["Date"].strftime("%Y-%m-%d"),
            "value": float(row["Total"])
        }
        for _, row in daily_exceed_df.iterrows()
    ]

    # ========================
    # KLY Analysis
    # ========================

    filtered_df["Year"] = filtered_df["Date"].dt.year
    yearly_totals = filtered_df.groupby("Year")["Total"].sum()

    mean_kly = yearly_totals.mean()
    annual_violation_details = [
        {
            "year": int(year),
            "total": float(total)
        }
        for year, total in yearly_totals.items()
        if total > 1350500
    ]

    annual_exceed_count = len(annual_violation_details)

    # ========================
    # Trend Analysis (ML)
    # ========================

    filtered_df = filtered_df.sort_values("Date")
    filtered_df["Day_Index"] = np.arange(len(filtered_df))

    model = LinearRegression()
    model.fit(filtered_df[["Day_Index"]], filtered_df["Total"])
    trend_slope = float(model.coef_[0])

    # ========================
    # Final Response
    # ========================

    return {
        "average_kld": round(mean_kld, 2),
        "daily_exceed_count": daily_exceed_count,
        "daily_violation_details": daily_violation_details,
        "average_kly": round(mean_kly, 2),
        "annual_exceed_count": annual_exceed_count,
        "annual_violation_details": annual_violation_details,
        "trend_slope": round(trend_slope, 4)
    }
