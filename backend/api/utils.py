import requests
from django.conf import settings

def check_fact(query):
    """
    Checks the claim using Google Fact Check Tools API.
    """
    if not settings.GOOGLE_API_KEY:
        return None

    url = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
    params = {
        "query": query,
        "key": settings.GOOGLE_API_KEY
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()

        if "claims" in data and len(data["claims"]) > 0:
            claim = data["claims"][0]
            if "claimReview" in claim and len(claim["claimReview"]) > 0:
                review = claim["claimReview"][0]
                return {
                    "textualRating": review.get("textualRating", "No rating"),
                    "publisher": review.get("publisher", {}).get("name", "Unknown"),
                    "url": review.get("url", "")
                }
    except Exception as e:
        print(f"Error checking fact: {e}")
    
    return None
